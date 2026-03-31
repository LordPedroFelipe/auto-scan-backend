import { ForbiddenException, Injectable, MessageEvent } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import OpenAI from 'openai';
import { randomUUID } from 'crypto';
import { Observable, Subject } from 'rxjs';
import { DataSource, Repository } from 'typeorm';
import { LeadEntity, LeadStatus } from '../leads/entities/lead.entity';
import { ShopEntity } from '../shops/entities/shop.entity';
import { TestDriveEntity, TestDriveStatus } from '../test-drives/entities/test-drive.entity';
import { JwtUser } from '../auth/jwt-user.interface';
import { UserEntity } from '../users/entities/user.entity';
import { VehicleEntity } from '../vehicles/entities/vehicle.entity';
import { SendChatMessageDto } from './dto/send-chat-message.dto';
import { ChatMessageEntity } from './entities/chat-message.entity';
import { ChatSessionEntity } from './entities/chat-session.entity';
import { ChatTelemetryEventEntity } from './entities/chat-telemetry-event.entity';
import {
  ChatCustomerProfile,
  ChatLeadSummary,
  ChatOption,
  ChatReply,
  ChatSessionState,
  ChatTelemetrySnapshot,
  ChatVehicleCard,
  FinancingSimulation,
} from './chat.types';

type ChatIntent = 'greeting' | 'vehicle_search' | 'vehicle_context' | 'financing' | 'test_drive' | 'handoff' | 'lead_capture';
type ToolName = 'buscarVeiculos' | 'registrarLead' | 'agendarTestDrive' | 'transferirParaVendedor';

type ToolCallResult = { toolName: ToolName; payload: Record<string, unknown> };
type ConversationContext = { contextVehicle: VehicleEntity | null; seller: UserEntity | null };
type SendExecutionResult = {
  session: ChatSessionState;
  intent: ChatIntent;
  contextVehicle: VehicleEntity | null;
  recommendations: ChatVehicleCard[];
  lead: ChatLeadSummary | null;
  financing: FinancingSimulation | null;
  telemetry: ChatTelemetrySnapshot;
};

@Injectable()
export class ChatService {
  private readonly openAiClient: OpenAI | null;
  private readonly aiEnabled: boolean;
  private readonly aiModel: string;
  private readonly streamChannels = new Map<string, Subject<MessageEvent>>();

  constructor(
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource,
    @InjectRepository(ShopEntity) private readonly shopsRepository: Repository<ShopEntity>,
    @InjectRepository(VehicleEntity) private readonly vehiclesRepository: Repository<VehicleEntity>,
    @InjectRepository(LeadEntity) private readonly leadsRepository: Repository<LeadEntity>,
    @InjectRepository(UserEntity) private readonly usersRepository: Repository<UserEntity>,
    @InjectRepository(TestDriveEntity) private readonly testDrivesRepository: Repository<TestDriveEntity>,
    @InjectRepository(ChatSessionEntity) private readonly chatSessionsRepository: Repository<ChatSessionEntity>,
    @InjectRepository(ChatMessageEntity) private readonly chatMessagesRepository: Repository<ChatMessageEntity>,
    @InjectRepository(ChatTelemetryEventEntity) private readonly chatTelemetryRepository: Repository<ChatTelemetryEventEntity>,
  ) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    this.aiEnabled = !!apiKey;
    this.aiModel = this.configService.get<string>('OPENAI_MODEL', 'gpt-5-mini') ?? 'gpt-5-mini';
    this.openAiClient = apiKey ? new OpenAI({ apiKey }) : null;
  }

  streamSession(sessionId: string): Observable<MessageEvent> {
    return new Observable<MessageEvent>((subscriber) => {
      subscriber.next({ type: 'connected', data: { sessionId, connectedAt: new Date().toISOString() } });
      const channel = this.getStreamChannel(sessionId);
      const subscription = channel.subscribe({ next: (event) => subscriber.next(event), error: (error) => subscriber.error(error) });
      return () => subscription.unsubscribe();
    });
  }

  async send(dto: SendChatMessageDto): Promise<ChatReply> {
    const startedAt = Date.now();
    this.publishStream(dto.sessionId, 'status', { step: 'received' });
    const execution = await this.executeConversationTurn(dto);
    const reply = await this.buildReply(execution, dto.message);

    await this.appendAssistantMessage(execution.session, reply.message, {
      replyId: reply.id,
      intent: execution.intent,
      leadId: reply.lead?.id ?? null,
      financing: reply.financing,
      vehicles: reply.vehicles.map((vehicle) => ({ id: vehicle.id, score: vehicle.matchScore })),
    });

    execution.session.summary = await this.refreshSummary(execution.session);
    await this.persistSessionSnapshot(execution.session);
    const durationMs = Date.now() - startedAt;
    await this.logTelemetry(execution.session.id, 'response.generated', `Resposta gerada em ${durationMs}ms.`, {
      durationMs,
      intent: execution.intent,
      toolsUsed: execution.telemetry.toolsUsed,
      nextBestAction: reply.nextBestAction,
    });

    await this.streamReply(dto.sessionId, reply, execution.telemetry);
    return reply;
  }

  async reset(sessionId: string, user: JwtUser) {
    const session = await this.chatSessionsRepository.findOne({ where: { sessionKey: sessionId } });
    if (session) {
      this.ensureSessionAccess(session, user);
      await this.chatSessionsRepository.remove(session);
    }
    this.publishStream(sessionId, 'reset', { success: true });
    return { success: true };
  }

  async sessionsList(user: JwtUser) {
    const sessions = await this.chatSessionsRepository.find({
      where: this.buildShopScope(user),
      order: { updatedAt: 'DESC' },
      take: 100,
    });
    return sessions.map((session) => ({
      sessionId: session.sessionKey,
      totalMessages: session.messagesCount,
      shopId: session.shopId,
      vehicleId: session.vehicleId,
      leadId: session.leadId,
      updatedAt: session.updatedAt.toISOString(),
      summary: session.summary,
      toolCallsCount: session.toolCallsCount,
      handoffsCount: session.handoffsCount,
    }));
  }

  async messages(sessionId: string, user: JwtUser) {
    const session = await this.chatSessionsRepository.findOne({ where: { sessionKey: sessionId } });
    if (!session) return [];
    this.ensureSessionAccess(session, user);
    const messages = await this.chatMessagesRepository.find({ where: { sessionId: session.id }, order: { createdAt: 'ASC' } });
    return messages.map((message) => ({
      id: message.id,
      autor: message.author === 'Cliente' ? 'Cliente' : 'IA',
      texto: message.text,
      data: message.createdAt.toISOString(),
      metadata: message.metadata ?? undefined,
    }));
  }

  async keywords(user: JwtUser) {
    const query = this.chatSessionsRepository
      .createQueryBuilder('session')
      .select('unnest(session.keywords)', 'keyword')
      .addSelect('COUNT(*)::int', 'count');

    if (user.shopId) {
      query.where('session.shopId = :shopId', { shopId: user.shopId });
    }

    const rows = await query.groupBy('keyword').orderBy('count', 'DESC').limit(10).getRawMany<{ keyword: string; count: string }>();
    return rows.map((row) => ({ keyword: row.keyword, count: Number(row.count) }));
  }

  health() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '0.3.0',
      ai: {
        provider: 'openai',
        enabled: this.aiEnabled,
        model: this.aiEnabled ? this.aiModel : null,
        mode: this.aiEnabled ? 'responses-api-with-tools' : 'deterministic-tool-orchestrator',
      },
    };
  }

  async metrics(user: JwtUser) {
    const memory = process.memoryUsage();
    const scopedSessions = await this.chatSessionsRepository.find({
      where: this.buildShopScope(user),
      select: { id: true, handoffsCount: true },
    });
    const sessionIds = scopedSessions.map((session) => session.id);
    const sessions = scopedSessions.length;
    const messages = sessionIds.length
      ? await this.chatMessagesRepository.createQueryBuilder('message').where('message.sessionId IN (:...sessionIds)', { sessionIds }).getCount()
      : 0;
    const events = sessionIds.length
      ? await this.chatTelemetryRepository.createQueryBuilder('event').where('event.sessionId IN (:...sessionIds)', { sessionIds }).getCount()
      : 0;
    const handoffs = scopedSessions.reduce((sum, session) => sum + (session.handoffsCount ?? 0), 0);

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      chat: { sessions, messages, telemetryEvents: events, handoffs },
      ai: { enabled: this.aiEnabled, model: this.aiEnabled ? this.aiModel : null },
      system: {
        uptime: Math.round(process.uptime()),
        memory: {
          total: memory.heapTotal,
          used: memory.heapUsed,
          free: Math.max(memory.heapTotal - memory.heapUsed, 0),
          usagePercent: memory.heapTotal > 0 ? Math.round((memory.heapUsed / memory.heapTotal) * 100) : 0,
        },
        cpu: { usagePercent: 0 },
      },
    };
  }

  async observability(user: JwtUser) {
    const scopedSessions = await this.chatSessionsRepository.find({ where: this.buildShopScope(user), select: { id: true } });
    const sessionIds = scopedSessions.map((session) => session.id);
    const [messages, telemetryEvents, leads, testDrives] = await Promise.all([
      sessionIds.length
        ? this.chatMessagesRepository.createQueryBuilder('message').where('message.sessionId IN (:...sessionIds)', { sessionIds }).getCount()
        : 0,
      sessionIds.length
        ? this.chatTelemetryRepository.createQueryBuilder('event').where('event.sessionId IN (:...sessionIds)', { sessionIds }).getCount()
        : 0,
      this.leadsRepository.count({ where: this.buildShopScope(user) }),
      this.testDrivesRepository.count({ where: this.buildShopScope(user) }),
    ]);
    const toolQuery = this.chatTelemetryRepository
      .createQueryBuilder('event')
      .select("event.payload->>'toolName'", 'tool')
      .addSelect('COUNT(*)::int', 'count')
      .where("event.type = 'tool.called'");

    if (sessionIds.length) toolQuery.andWhere('event.sessionId IN (:...sessionIds)', { sessionIds });
    else toolQuery.andWhere('1 = 0');

    const toolRows = await toolQuery.groupBy('tool').orderBy('count', 'DESC').limit(10).getRawMany<{ tool: string | null; count: string }>();

    const recentEvents = sessionIds.length
      ? await this.chatTelemetryRepository
          .createQueryBuilder('event')
          .where('event.sessionId IN (:...sessionIds)', { sessionIds })
          .orderBy('event.createdAt', 'DESC')
          .limit(20)
          .getMany()
      : [];

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      overview: { sessions: scopedSessions.length, messages, telemetryEvents, leads, testDrives },
      tools: toolRows.filter((row) => !!row.tool).map((row) => ({ name: row.tool as string, count: Number(row.count) })),
      recentEvents: recentEvents.map((event) => ({
        id: event.id,
        type: event.type,
        level: event.level,
        message: event.message,
        payload: event.payload,
        createdAt: event.createdAt.toISOString(),
      })),
    };
  }

  async dbStatus() {
    const [shopsCount, vehiclesCount, activeVehiclesCount, leadsCount, sessionsCount, chatMessagesCount] = await Promise.all([
      this.shopsRepository.count(),
      this.vehiclesRepository.count(),
      this.vehiclesRepository.count({ where: { isActive: true } }),
      this.leadsRepository.count(),
      this.chatSessionsRepository.count(),
      this.chatMessagesRepository.count(),
    ]);

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: {
        connection: this.dataSource.isInitialized ? 'up' : 'down',
        state: this.dataSource.isInitialized ? 'connected' : 'disconnected',
        canConnect: this.dataSource.isInitialized,
        pendingMigrations: [],
        appliedMigrations: [],
        tables_size_in_mb_total: '0',
        tables_row_count: {
          shops: shopsCount,
          vehicles: vehiclesCount,
          activeVehicles: activeVehiclesCount,
          leads: leadsCount,
          chatSessions: sessionsCount,
          chatMessages: chatMessagesCount,
        },
        tables_size_in_mb: [],
      },
    };
  }

  private async executeConversationTurn(dto: SendChatMessageDto): Promise<SendExecutionResult> {
    const session = await this.getOrCreateSession(dto);
    this.applyExplicitProfile(session, dto);
    await this.appendCustomerMessage(session, dto.message);

    const intent = this.detectIntent(dto.message);
    const { contextVehicle, seller } = await this.resolveConversationContext(session, dto);
    const toolResults = await this.executeTools(session, intent, dto.message, contextVehicle, seller);

    const recommendations =
      (toolResults.find((tool) => tool.toolName === 'buscarVeiculos')?.payload.vehicles as ChatVehicleCard[] | undefined) ??
      (await this.findRelevantVehicles(session, intent));

    session.lastRecommendedVehicleIds = recommendations.map((vehicle) => vehicle.id);
    const lead = (toolResults.find((tool) => tool.toolName === 'registrarLead')?.payload.lead as ChatLeadSummary | undefined) ?? null;
    if (lead?.id) session.leadId = lead.id;
    const financing = this.buildFinancingSimulation(recommendations, dto.message);
    session.summary = await this.refreshSummary(session);

    return {
      session,
      intent,
      contextVehicle,
      recommendations,
      lead,
      financing,
      telemetry: {
        toolsUsed: toolResults.map((tool) => tool.toolName),
        scoringVersion: 'v2-weighted-commercial-score',
        summaryVersion: 'v1-compressed-session-summary',
        responseMode: 'streaming',
      },
    };
  }

  private async buildReply(execution: SendExecutionResult, latestMessage: string): Promise<ChatReply> {
    const deterministic = this.buildDeterministicReply(
      execution.session,
      execution.intent,
      execution.recommendations,
      execution.lead,
      latestMessage,
      execution.contextVehicle,
      execution.financing,
      execution.telemetry,
    );

    const enrichedMessage = await this.enrichWithOpenAi(execution, deterministic, latestMessage);
    return { ...deterministic, message: enrichedMessage, summary: execution.session.summary };
  }

  private async getOrCreateSession(dto: SendChatMessageDto): Promise<ChatSessionState> {
    const existing = await this.chatSessionsRepository.findOne({ where: { sessionKey: dto.sessionId } });
    if (existing) return this.hydrateSessionState(existing);

    const saved = await this.chatSessionsRepository.save(
      this.chatSessionsRepository.create({
        sessionKey: dto.sessionId,
        shopId: dto.shopId ?? null,
        vehicleId: dto.vehicleId ?? null,
        leadId: null,
        customerProfile: this.createEmptyProfile(),
        summary: null,
        lastRecommendedVehicleIds: [],
        keywords: [],
        messagesCount: 0,
        toolCallsCount: 0,
        handoffsCount: 0,
        lastCustomerMessageAt: null,
        lastAssistantMessageAt: null,
      }),
    );

    return this.hydrateSessionState(saved);
  }

  private async hydrateSessionState(entity: ChatSessionEntity): Promise<ChatSessionState> {
    const messages = await this.chatMessagesRepository.find({ where: { sessionId: entity.id }, order: { createdAt: 'ASC' }, take: 40 });
    return {
      id: entity.id,
      sessionId: entity.sessionKey,
      shopId: entity.shopId,
      vehicleId: entity.vehicleId,
      leadId: entity.leadId,
      customerProfile: this.normalizeProfileRecord(entity.customerProfile),
      messages: messages.map((message) => ({
        id: message.id,
        autor: message.author === 'Cliente' ? 'Cliente' : 'IA',
        texto: message.text,
        data: message.createdAt.toISOString(),
        metadata: message.metadata ?? undefined,
      })),
      lastRecommendedVehicleIds: entity.lastRecommendedVehicleIds ?? [],
      keywords: entity.keywords ?? [],
      summary: entity.summary,
      toolCallsCount: entity.toolCallsCount ?? 0,
      handoffsCount: entity.handoffsCount ?? 0,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
    };
  }

  private createEmptyProfile(): ChatCustomerProfile {
    return {
      name: null,
      email: null,
      phone: null,
      city: null,
      budgetMax: null,
      budgetMin: null,
      preferredCategories: [],
      preferredBrands: [],
      preferredFuelTypes: [],
      preferredTransmissions: [],
      desiredUses: [],
      plate: null,
    };
  }

  private normalizeProfileRecord(profile: Record<string, unknown> | null | undefined): ChatCustomerProfile {
    const safeProfile = profile ?? {};
    return {
      ...this.createEmptyProfile(),
      ...(safeProfile as Partial<ChatCustomerProfile>),
      preferredCategories: Array.isArray(safeProfile.preferredCategories) ? (safeProfile.preferredCategories as string[]) : [],
      preferredBrands: Array.isArray(safeProfile.preferredBrands) ? (safeProfile.preferredBrands as string[]) : [],
      preferredFuelTypes: Array.isArray(safeProfile.preferredFuelTypes) ? (safeProfile.preferredFuelTypes as string[]) : [],
      preferredTransmissions: Array.isArray(safeProfile.preferredTransmissions) ? (safeProfile.preferredTransmissions as string[]) : [],
      desiredUses: Array.isArray(safeProfile.desiredUses) ? (safeProfile.desiredUses as string[]) : [],
    };
  }

  private applyExplicitProfile(session: ChatSessionState, dto: SendChatMessageDto) {
    if (dto.shopId) session.shopId = dto.shopId;
    if (dto.vehicleId) session.vehicleId = dto.vehicleId;
    if (dto.plate) session.customerProfile.plate = dto.plate.toUpperCase();
    if (dto.customerName) session.customerProfile.name = dto.customerName.trim();
    if (dto.customerEmail) session.customerProfile.email = dto.customerEmail.toLowerCase();
    if (dto.customerPhone) session.customerProfile.phone = dto.customerPhone.trim();
    if (dto.customerCity) session.customerProfile.city = dto.customerCity.trim();
    this.mergeExtractedProfile(session, dto.message);
  }

  private async appendCustomerMessage(session: ChatSessionState, message: string) {
    const created = await this.chatMessagesRepository.save(this.chatMessagesRepository.create({ sessionId: session.id, author: 'Cliente', text: message, metadata: null }));
    session.messages.push({ id: created.id, autor: 'Cliente', texto: message, data: created.createdAt.toISOString() });
    session.updatedAt = created.createdAt.toISOString();
    await this.persistSessionSnapshot(session, { lastCustomerMessageAt: created.createdAt, incrementMessages: true });
    await this.logTelemetry(session.id, 'message.customer', 'Mensagem do cliente recebida.', { sessionId: session.sessionId });
  }

  private async appendAssistantMessage(session: ChatSessionState, message: string, metadata?: Record<string, unknown>) {
    const created = await this.chatMessagesRepository.save(this.chatMessagesRepository.create({ sessionId: session.id, author: 'IA', text: message, metadata: metadata ?? null }));
    session.messages.push({ id: created.id, autor: 'IA', texto: message, data: created.createdAt.toISOString(), metadata });
    session.updatedAt = created.createdAt.toISOString();
    await this.persistSessionSnapshot(session, { lastAssistantMessageAt: created.createdAt, incrementMessages: true });
  }
  private async persistSessionSnapshot(
    session: ChatSessionState,
    overrides?: { lastCustomerMessageAt?: Date; lastAssistantMessageAt?: Date; incrementMessages?: boolean },
  ) {
    const entity = await this.chatSessionsRepository.findOneByOrFail({ id: session.id });
    entity.shopId = session.shopId;
    entity.vehicleId = session.vehicleId;
    entity.leadId = session.leadId;
    entity.customerProfile = session.customerProfile as unknown as Record<string, unknown>;
    entity.summary = session.summary;
    entity.lastRecommendedVehicleIds = session.lastRecommendedVehicleIds;
    entity.keywords = session.keywords;
    entity.toolCallsCount = session.toolCallsCount;
    entity.handoffsCount = session.handoffsCount;
    if (overrides?.incrementMessages) entity.messagesCount = session.messages.length;
    if (overrides?.lastCustomerMessageAt) entity.lastCustomerMessageAt = overrides.lastCustomerMessageAt;
    if (overrides?.lastAssistantMessageAt) entity.lastAssistantMessageAt = overrides.lastAssistantMessageAt;
    await this.chatSessionsRepository.save(entity);
  }

  private detectIntent(message: string): ChatIntent {
    const normalized = this.normalize(message);
    if (/(financi|parcel|entrada|prestac|simula)/.test(normalized)) return 'financing';
    if (/(test drive|dirigir|agendar|agendamento|visita)/.test(normalized)) return 'test_drive';
    if (/(vendedor|humano|atendente|whatsapp|ligar)/.test(normalized)) return 'handoff';
    if (/(meu nome|me chama|me chamo|meu telefone|meu whatsapp|meu email|meu e-mail)/.test(normalized)) return 'lead_capture';
    if (/(placa|esse carro|este carro|esse veiculo|esse veículo)/.test(normalized)) return 'vehicle_context';
    if (/(carro|suv|sedan|hatch|pickup|caminhonete|economico|econômico|familia|família|ate |até |mil)/.test(normalized)) return 'vehicle_search';
    return 'greeting';
  }

  private async resolveConversationContext(session: ChatSessionState, dto: SendChatMessageDto): Promise<ConversationContext> {
    let contextVehicle: VehicleEntity | null = null;
    const selectedVehicle = await this.resolveSelectedVehicleFromMessage(session, dto.message);
    if (selectedVehicle) {
      session.vehicleId = selectedVehicle.id;
      session.shopId = selectedVehicle.shopId;
      contextVehicle = selectedVehicle;
    }

    if (session.vehicleId) contextVehicle = await this.vehiclesRepository.findOne({ where: { id: session.vehicleId } });

    if (!contextVehicle && session.customerProfile.plate) {
      contextVehicle = await this.vehiclesRepository.findOne({ where: { plate: session.customerProfile.plate, isActive: true } });
      if (contextVehicle) session.vehicleId = contextVehicle.id;
    }

    if (contextVehicle && !session.shopId) session.shopId = contextVehicle.shopId;

    if (!session.shopId && dto.shopId) session.shopId = dto.shopId;
    return { contextVehicle, seller: session.shopId ? await this.pickSeller(session.shopId) : null };
  }

  private async resolveSelectedVehicleFromMessage(session: ChatSessionState, message: string) {
    if (!session.lastRecommendedVehicleIds.length) return null;

    const candidates = await this.vehiclesRepository.find({
      where: session.lastRecommendedVehicleIds.map((id) => ({ id, isActive: true })),
    });

    if (!candidates.length) return null;

    const normalizedMessage = this.normalize(message);
    const explicitSelectionSignal = /(quero esse|quero este|esse veiculo|esse veículo|esse carro|este carro|gostei desse|fiquei com esse)/.test(normalizedMessage);

    for (const vehicle of candidates) {
      const title = this.normalize(`${vehicle.brand} ${vehicle.model}`);
      const subtitle = this.normalize(vehicle.version ?? '');
      const fullLabel = this.normalize([vehicle.brand, vehicle.model, vehicle.version, `r$ ${Number(vehicle.price).toLocaleString('pt-BR')}`].filter(Boolean).join(' '));

      if (title && normalizedMessage.includes(title)) return vehicle;
      if (subtitle && normalizedMessage.includes(subtitle)) return vehicle;
      if (fullLabel && normalizedMessage.includes(fullLabel)) return vehicle;
    }

    return explicitSelectionSignal ? candidates[0] ?? null : null;
  }

  private async executeTools(
    session: ChatSessionState,
    intent: ChatIntent,
    latestMessage: string,
    contextVehicle: VehicleEntity | null,
    seller: UserEntity | null,
  ): Promise<ToolCallResult[]> {
    const deterministicToolNames = this.planToolsDeterministically(session, intent, latestMessage, contextVehicle);
    if (!this.openAiClient) return this.executeNamedTools(deterministicToolNames, session, intent, latestMessage, contextVehicle, seller);

    try {
      const response: any = await this.openAiClient.responses.create({
        model: this.aiModel,
        input: JSON.stringify({
          message: latestMessage,
          intent,
          profile: session.customerProfile,
          summary: session.summary,
          hasLead: !!session.leadId,
          contextVehicle: contextVehicle ? { id: contextVehicle.id, brand: contextVehicle.brand, model: contextVehicle.model } : null,
        }),
        tools: [
          { type: 'function', strict: true, name: 'buscarVeiculos', description: 'Busca veiculos do estoque real.', parameters: { type: 'object', properties: { reason: { type: 'string' } }, required: ['reason'] } },
          { type: 'function', strict: true, name: 'registrarLead', description: 'Cria ou atualiza lead.', parameters: { type: 'object', properties: { qualificationReason: { type: 'string' } }, required: ['qualificationReason'] } },
          { type: 'function', strict: true, name: 'agendarTestDrive', description: 'Agenda test drive quando houver contexto suficiente.', parameters: { type: 'object', properties: { requestedWindow: { type: 'string' } }, required: ['requestedWindow'] } },
          { type: 'function', strict: true, name: 'transferirParaVendedor', description: 'Prepara handoff para vendedor humano.', parameters: { type: 'object', properties: { handoffReason: { type: 'string' } }, required: ['handoffReason'] } },
        ],
        tool_choice: 'auto',
      });

      const toolCalls = Array.isArray(response.output) ? response.output.filter((item: any) => item?.type === 'function_call') : [];
      const names = toolCalls.map((toolCall: any) => toolCall.name as ToolName).filter((toolName: ToolName) => deterministicToolNames.includes(toolName));
      return this.executeNamedTools(names.length ? Array.from(new Set(names)) : deterministicToolNames, session, intent, latestMessage, contextVehicle, seller);
    } catch {
      return this.executeNamedTools(deterministicToolNames, session, intent, latestMessage, contextVehicle, seller);
    }
  }

  private planToolsDeterministically(
    session: ChatSessionState,
    intent: ChatIntent,
    latestMessage: string,
    contextVehicle: VehicleEntity | null,
  ): ToolName[] {
    const tools: ToolName[] = ['buscarVeiculos'];
    const hasUsefulContact = !!(session.customerProfile.name && (session.customerProfile.phone || session.customerProfile.email));
    if (hasUsefulContact && ['handoff', 'financing', 'test_drive', 'lead_capture'].includes(intent)) tools.push('registrarLead');
    if ((intent === 'handoff' || /(vendedor|whatsapp|humano|ligar)/i.test(latestMessage)) && hasUsefulContact) tools.push('transferirParaVendedor');
    if (intent === 'test_drive' && contextVehicle && hasUsefulContact && this.extractScheduleSignal(latestMessage)) tools.push('agendarTestDrive');
    return Array.from(new Set(tools));
  }

  private async executeNamedTools(
    toolNames: ToolName[],
    session: ChatSessionState,
    intent: ChatIntent,
    latestMessage: string,
    contextVehicle: VehicleEntity | null,
    seller: UserEntity | null,
  ): Promise<ToolCallResult[]> {
    const results: ToolCallResult[] = [];

    for (const toolName of toolNames) {
      if (toolName === 'buscarVeiculos') results.push({ toolName, payload: { vehicles: await this.findRelevantVehicles(session, intent) } });
      if (toolName === 'registrarLead') results.push({ toolName, payload: { lead: await this.registerLeadFromConversation(session, intent, latestMessage) } });
      if (toolName === 'agendarTestDrive') results.push({ toolName, payload: { testDrive: await this.scheduleTestDrive(session, latestMessage, contextVehicle) } });
      if (toolName === 'transferirParaVendedor') results.push({ toolName, payload: { handoff: await this.transferToSeller(session, seller, latestMessage) } });

      session.toolCallsCount += 1;
      await this.persistSessionSnapshot(session);
      await this.logTelemetry(session.id, 'tool.called', `Ferramenta ${toolName} executada.`, { toolName, intent });
      this.publishStream(session.sessionId, 'tool', { toolName, status: 'completed' });
    }

    return results;
  }

  private async findRelevantVehicles(session: ChatSessionState, intent: ChatIntent): Promise<ChatVehicleCard[]> {
    const qb = this.vehiclesRepository.createQueryBuilder('vehicle').leftJoinAndSelect('vehicle.shop', 'shop').where('vehicle.isActive = true');
    if (session.shopId) qb.andWhere('vehicle.shopId = :shopId', { shopId: session.shopId });

    if (session.vehicleId) qb.andWhere('vehicle.id = :vehicleId', { vehicleId: session.vehicleId });
    else if (session.customerProfile.plate) qb.andWhere('vehicle.plate = :plate', { plate: session.customerProfile.plate });
    else {
      if (session.customerProfile.budgetMax) qb.andWhere('vehicle.price <= :maxPrice', { maxPrice: Math.round(session.customerProfile.budgetMax * 1.2) });
      if (session.customerProfile.budgetMin) qb.andWhere('vehicle.price >= :minPrice', { minPrice: Math.max(Math.round(session.customerProfile.budgetMin * 0.8), 0) });
      if (session.customerProfile.preferredBrands.length > 0) {
        qb.andWhere(
          session.customerProfile.preferredBrands.map((_, index) => `vehicle.brand ILIKE :brand${index}`).join(' OR '),
          Object.fromEntries(session.customerProfile.preferredBrands.map((brand, index) => [`brand${index}`, `%${brand}%`])),
        );
      }
    }

    const baseVehicles = await qb.orderBy('vehicle.isHighlighted', 'DESC').addOrderBy('vehicle.isOnOffer', 'DESC').addOrderBy('vehicle.createdAt', 'DESC').take(40).getMany();
    return baseVehicles.map((vehicle) => this.rankVehicle(vehicle, session, intent)).filter((vehicle) => vehicle.matchScore > 0).sort((left, right) => right.matchScore - left.matchScore).slice(0, 5);
  }

  private rankVehicle(vehicle: VehicleEntity, session: ChatSessionState, intent: ChatIntent): ChatVehicleCard {
    const profile = session.customerProfile;
    const searchableText = this.normalize([vehicle.brand, vehicle.model, vehicle.version, vehicle.categoryType, vehicle.description, vehicle.fuelType, vehicle.transmission].filter(Boolean).join(' '));
    let score = 18;
    let financeScore = 45;
    const reasons: string[] = [];
    const price = Number(vehicle.price);
    const priceDelta = profile.budgetMax ? profile.budgetMax - price : null;

    if (session.vehicleId === vehicle.id || (profile.plate && vehicle.plate === profile.plate)) {
      score += 90;
      financeScore += 20;
      reasons.push('corresponde exatamente ao veiculo em contexto');
    }

    if (profile.budgetMax) {
      if (price <= profile.budgetMax) {
        score += 28;
        financeScore += 12;
        reasons.push('fica dentro do orcamento informado');
      } else if (price <= profile.budgetMax * 1.1) {
        score += 14;
        financeScore += 18;
        reasons.push('fica muito proximo do orcamento');
      } else {
        score -= 24;
        financeScore += 8;
      }
    }
    if (profile.budgetMin && price >= profile.budgetMin) score += 8;
    for (const category of profile.preferredCategories) if (searchableText.includes(this.normalize(category))) { score += 14; reasons.push(`combina com o perfil ${category}`); }
    for (const brand of profile.preferredBrands) if (this.normalize(vehicle.brand).includes(this.normalize(brand))) { score += 12; reasons.push(`marca alinhada com a preferencia por ${brand}`); }
    for (const fuel of profile.preferredFuelTypes) if (searchableText.includes(this.normalize(fuel))) { score += 10; reasons.push(`motorizacao compativel com preferencia por ${fuel}`); }
    for (const transmission of profile.preferredTransmissions) if (searchableText.includes(this.normalize(transmission))) { score += 9; reasons.push(`cambio ${transmission.toLowerCase()} como voce pediu`); }
    if (profile.desiredUses.includes('cidade') && (vehicle.mileage ?? 0) < 80000) { score += 6; reasons.push('boa opcao para uso urbano'); }
    if (profile.desiredUses.includes('familia') && /(suv|sedan|7 lugares)/.test(searchableText)) { score += 9; reasons.push('tem perfil forte para uso em familia'); }
    if (profile.desiredUses.includes('economia') && /(flex|hibrido|1\.0|1\.3)/.test(searchableText)) { score += 8; reasons.push('boa chance de custo de uso equilibrado'); }
    if ((vehicle.mileage ?? 0) <= 40000) { score += 6; financeScore += 4; reasons.push('quilometragem competitiva'); }
    if (vehicle.isOnOffer) { score += 5; financeScore += 5; reasons.push('esta em oferta'); }
    if (vehicle.isHighlighted) { score += 5; reasons.push('e um destaque da loja'); }
    if (intent === 'financing') { financeScore += 15; if (priceDelta !== null && priceDelta < 0) { financeScore += 10; reasons.push('faz sentido para avancar com financiamento'); } }

    return {
      id: vehicle.id,
      title: `${vehicle.brand} ${vehicle.model}`,
      subtitle: vehicle.version ?? null,
      price,
      year: vehicle.year,
      mileage: vehicle.mileage === null ? null : Number(vehicle.mileage),
      photoUrl: vehicle.thumbnailPhotoUrls?.[0] ?? vehicle.photoUrls?.[0] ?? null,
      shopId: vehicle.shopId,
      matchScore: score,
      financeScore,
      reasons: Array.from(new Set(reasons)).slice(0, 4),
      plate: vehicle.plate ?? null,
      pricingContext: {
        priceDeltaToBudget: priceDelta,
        affordabilityBand: priceDelta === null ? 'unknown' : priceDelta >= 0 ? 'inside_budget' : Math.abs(priceDelta) <= price * 0.1 ? 'near_budget' : 'above_budget',
      },
    };
  }

  private async registerLeadFromConversation(session: ChatSessionState, intent: ChatIntent, latestMessage: string): Promise<ChatLeadSummary | null> {
    const profile = session.customerProfile;
    const hasUsefulContact = !!(profile.name && (profile.phone || profile.email));
    if (!hasUsefulContact || !session.shopId) return null;

    const seller = await this.pickSeller(session.shopId);
    const notes = this.buildLeadNotes(session, latestMessage);
    if (session.leadId) {
      const existingLead = await this.leadsRepository.findOne({ where: { id: session.leadId }, relations: { seller: true } });
      if (existingLead) {
        existingLead.notes = notes;
        existingLead.vehicleId = session.lastRecommendedVehicleIds[0] ?? session.vehicleId ?? existingLead.vehicleId;
        existingLead.sellerId = existingLead.sellerId ?? seller?.id ?? null;
        if (['handoff', 'test_drive', 'financing'].includes(intent)) existingLead.status = LeadStatus.Qualified;
        const saved = await this.leadsRepository.save(existingLead);
        session.leadId = saved.id;
        return { id: saved.id, sellerId: saved.sellerId ?? null, sellerName: existingLead.seller?.userName ?? seller?.userName ?? null, status: saved.status };
      }
    }

    const createdLead = await this.leadsRepository.save(this.leadsRepository.create({
      name: profile.name!,
      email: profile.email ?? null,
      phone: profile.phone ?? null,
      city: profile.city ?? null,
      notes,
      status: ['handoff', 'test_drive', 'financing'].includes(intent) ? LeadStatus.Qualified : LeadStatus.New,
      hasBeenContacted: false,
      isActive: true,
      shopId: session.shopId,
      vehicleId: session.lastRecommendedVehicleIds[0] ?? session.vehicleId ?? null,
      sellerId: seller?.id ?? null,
    }));

    session.leadId = createdLead.id;
    return { id: createdLead.id, sellerId: seller?.id ?? null, sellerName: seller?.userName ?? null, status: createdLead.status };
  }

  private async scheduleTestDrive(session: ChatSessionState, latestMessage: string, contextVehicle: VehicleEntity | null) {
    const profile = session.customerProfile;
    if (!contextVehicle || !profile.name || !(profile.phone || profile.email)) return null;
    const schedule = this.extractScheduleSignal(latestMessage);
    if (!schedule) return null;

    const existing = await this.testDrivesRepository.findOne({ where: { vehicleId: contextVehicle.id, ...(session.leadId ? { leadId: session.leadId } : {}) }, order: { createdAt: 'DESC' } });
    if (existing) return existing;

    return this.testDrivesRepository.save(this.testDrivesRepository.create({
      vehicleId: contextVehicle.id,
      shopId: session.shopId,
      leadId: session.leadId,
      customerName: profile.name,
      customerEmail: profile.email,
      customerPhone: profile.phone,
      preferredDate: schedule.preferredDate,
      preferredTime: schedule.preferredTime,
      notes: `Agendado automaticamente pela IA. Mensagem: ${latestMessage}`,
      status: TestDriveStatus.Pending,
    }));
  }

  private async transferToSeller(session: ChatSessionState, seller: UserEntity | null, latestMessage: string) {
    session.handoffsCount += 1;
    await this.persistSessionSnapshot(session);
    return {
      sellerId: seller?.id ?? null,
      sellerName: seller?.userName ?? null,
      message: seller ? `Conversa preparada para ${seller.userName}.` : 'Conversa preparada para o proximo vendedor disponivel.',
      reason: latestMessage,
    };
  }

  private buildLeadNotes(session: ChatSessionState, latestMessage: string) {
    const profile = session.customerProfile;
    const tags = [
      profile.budgetMax ? `orcamento_max:${profile.budgetMax}` : null,
      profile.budgetMin ? `orcamento_min:${profile.budgetMin}` : null,
      profile.preferredCategories.length > 0 ? `categorias:${profile.preferredCategories.join(',')}` : null,
      profile.preferredBrands.length > 0 ? `marcas:${profile.preferredBrands.join(',')}` : null,
      profile.desiredUses.length > 0 ? `uso:${profile.desiredUses.join(',')}` : null,
      session.lastRecommendedVehicleIds.length > 0 ? `vehicleIds:${session.lastRecommendedVehicleIds.join(',')}` : null,
    ].filter(Boolean);

    return ['Lead criado automaticamente pelo modulo de IA do AutoScan.', `Sessao: ${session.sessionId}`, `Resumo: ${session.summary ?? 'sem resumo ainda'}`, `Ultima mensagem: ${latestMessage}`, ...tags].join('\n');
  }

  private buildDeterministicReply(
    session: ChatSessionState,
    intent: ChatIntent,
    recommendations: ChatVehicleCard[],
    lead: ChatLeadSummary | null,
    latestMessage: string,
    contextVehicle: VehicleEntity | null,
    financing: FinancingSimulation | null,
    telemetry: ChatTelemetrySnapshot,
  ): ChatReply {
    const profile = session.customerProfile;
    const customerName = profile.name ? `, ${profile.name}` : '';
    const options = this.buildQuickOptions(intent, lead, recommendations, financing);
    const photos = recommendations.map((vehicle) => vehicle.photoUrl).filter((url): url is string => !!url);
    const shouldCaptureLead = !lead && !(profile.name && (profile.phone || profile.email));
    const handoffSuggested = intent === 'handoff' || intent === 'test_drive' || intent === 'financing';
    const nextBestAction = handoffSuggested ? 'falar_com_vendedor' : shouldCaptureLead ? 'capturar_lead' : financing ? 'validar_simulacao' : recommendations.length > 0 ? 'apresentar_veiculos' : 'refinar_perfil';

    let message = `Oi${customerName}! `;
    if (contextVehicle) message += `Ja estou considerando o ${contextVehicle.brand} ${contextVehicle.model}${contextVehicle.version ? ` ${contextVehicle.version}` : ''} como contexto principal. `;

    if (intent === 'financing') message += 'Montei uma visao comercial para avancarmos no financiamento. ';
    else if (intent === 'test_drive') message += 'Perfeito, ja organizei o caminho para um test drive com menos atrito. ';
    else if (intent === 'handoff') message += 'Faz sentido envolver um vendedor humano agora para acelerar a conversao. ';
    else if (intent === 'vehicle_context') message += 'Analisei o veiculo em contexto e comparei com alternativas do estoque. ';
    else if (intent === 'vehicle_search') message += 'Cruzei o que voce pediu com o estoque real da loja. ';
    else message += 'Posso atuar como seu vendedor digital e conduzir a proxima melhor acao. ';
    if (recommendations.length > 0) {
      const top = recommendations[0];
      message += `Meu destaque inicial e o ${top.title}${top.subtitle ? ` ${top.subtitle}` : ''}, por R$ ${top.price.toLocaleString('pt-BR')}. `;
      if (top.reasons.length > 0) message += `Ele apareceu forte porque ${top.reasons.join(', ')}. `;
      if (recommendations.length > 1) message += `Tambem deixei mais ${recommendations.length - 1} opcao(oes) bem aderentes na manga. `;
    } else {
      message += 'Ainda nao encontrei um match forte o bastante com o que ja sei. Se voce me disser orcamento, tipo de carro e uso principal, eu refino muito melhor. ';
    }

    if (financing) message += `Para financiamento, uma entrada estimada de R$ ${financing.downPayment.toLocaleString('pt-BR')} deixaria ${financing.termMonths}x de cerca de R$ ${financing.estimatedInstallment.toLocaleString('pt-BR')}. `;
    if (lead?.sellerName) message += `Ja deixei a conversa preparada para seguir com ${lead.sellerName}. `;
    else if (shouldCaptureLead) message += 'Se fizer sentido, ja posso registrar seu nome e telefone para o vendedor continuar exatamente deste ponto. ';
    if (telemetry.toolsUsed.length > 0) message += `Nesta etapa eu usei ${telemetry.toolsUsed.join(', ')} para nao responder no escuro.`;

    return { id: randomUUID(), message: message.trim(), options, photos, humor: recommendations.length > 0 ? 'happy' : 'curious', vehicles: recommendations, lead, profile, handoffSuggested, shouldCaptureLead, nextBestAction, summary: session.summary, financing, telemetry };
  }

  private buildQuickOptions(intent: ChatIntent, hasLead: ChatLeadSummary | null, vehicles: ChatVehicleCard[], financing: FinancingSimulation | null): ChatOption[] {
    const options = new Map<string, ChatOption>();
    if (vehicles.length > 0) {
      options.set('ver_mais', { label: 'Ver mais opcoes', kind: 'prompt', action: 'ver_mais_opcoes' });
      options.set('quero_esse', { label: 'Quero esse veiculo', kind: 'prompt', action: 'quero_esse_veiculo' });
    }
    if (intent !== 'financing') options.set('financiamento', { label: 'Simular financiamento', kind: 'prompt', action: 'simular_financiamento' });
    if (intent !== 'test_drive') options.set('test_drive', { label: 'Agendar test drive', kind: 'prompt', action: 'agendar_test_drive' });
    if (!hasLead) {
      options.set('contato', { label: 'Enviar meu contato', kind: 'prompt', action: 'enviar_contato' });
      options.set('vendedor', { label: 'Falar com vendedor', kind: 'prompt', action: 'falar_com_vendedor' });
    }
    if (financing) options.set('entrada', { label: 'Quero ajustar a entrada', kind: 'prompt', action: 'ajustar_entrada' });
    options.set('suv', { label: 'SUV ate 100 mil', kind: 'prompt', action: 'buscar_suv_100' });
    options.set('economico', { label: 'Carro economico', kind: 'prompt', action: 'buscar_economico' });
    return Array.from(options.values()).slice(0, 6);
  }

  private async enrichWithOpenAi(execution: SendExecutionResult, deterministic: ChatReply, latestMessage: string) {
    if (!this.openAiClient) return deterministic.message;
    try {
      const recommendationText = execution.recommendations.length
        ? execution.recommendations.map((vehicle, index) => `${index + 1}. ${vehicle.title} ${vehicle.subtitle ?? ''} - R$ ${vehicle.price.toLocaleString('pt-BR')} - score ${vehicle.matchScore} - motivos: ${vehicle.reasons.join(', ')}`).join('\n')
        : 'Nenhum veiculo forte encontrado ainda.';

      const prompt = [
        'Voce e o AutoScan, um vendedor digital consultivo especializado em carros.',
        'Responda em portugues do Brasil.',
        'Seja comercial, consultivo, objetivo e acolhedor.',
        'Nunca invente veiculos fora do estoque fornecido.',
        'Conduza a conversa para avanco comercial quando fizer sentido.',
        `Mensagem do cliente: ${latestMessage}`,
        `Perfil extraido: ${JSON.stringify(execution.session.customerProfile)}`,
        `Resumo da sessao: ${execution.session.summary ?? 'sem resumo'}`,
        `Lead atual: ${execution.lead ? JSON.stringify(execution.lead) : 'nenhum'}`,
        `Ferramentas usadas: ${execution.telemetry.toolsUsed.join(', ') || 'nenhuma'}`,
        `Sugestoes calculadas pelo backend:\n${recommendationText}`,
        `Simulacao de financiamento: ${execution.financing ? JSON.stringify(execution.financing) : 'nao aplicavel'}`,
        `Resposta base ja aprovada pelo backend: ${deterministic.message}`,
        'Reescreva a resposta final mantendo fidelidade total aos fatos acima.',
      ].join('\n');

      const response = await this.openAiClient.responses.create({ model: this.aiModel, input: prompt });
      return response.output_text?.trim() || deterministic.message;
    } catch {
      return deterministic.message;
    }
  }

  private buildFinancingSimulation(recommendations: ChatVehicleCard[], latestMessage: string): FinancingSimulation | null {
    const targetVehicle = recommendations[0];
    if (!targetVehicle || !/(financi|parcel|entrada|prestac|simula)/i.test(latestMessage)) return null;
    const downPayment = this.extractDownPayment(latestMessage, targetVehicle.price) ?? Math.round(targetVehicle.price * 0.2);
    const termMonths = this.extractTermMonths(latestMessage) ?? 48;
    const monthlyRate = 0.019;
    const financedAmount = Math.max(targetVehicle.price - downPayment, 0);
    const estimatedInstallment = financedAmount === 0 ? 0 : financedAmount * (monthlyRate / (1 - Math.pow(1 + monthlyRate, -termMonths)));
    return {
      vehicleId: targetVehicle.id,
      vehicleTitle: targetVehicle.title,
      vehiclePrice: targetVehicle.price,
      downPayment,
      financedAmount: Math.round(financedAmount),
      termMonths,
      estimatedInstallment: Math.round(estimatedInstallment),
      monthlyRate,
    };
  }

  private extractDownPayment(message: string, price: number) {
    const normalized = this.normalize(message);
    const percentageMatch = normalized.match(/(\d{1,2})\s?%\s?(?:de entrada|entrada)/i);
    if (percentageMatch) return Math.round(price * (Number(percentageMatch[1]) / 100));
    const valueMatch = normalized.match(/entrada\s*(?:de\s*)?(?:r\$\s*)?(\d+[\d\.,]*)/i);
    if (valueMatch) return this.parseMoneyToken(valueMatch[1], false);
    return null;
  }

  private extractTermMonths(message: string) {
    const match = this.normalize(message).match(/(\d{1,3})\s?x\b/);
    return match ? Number(match[1]) : null;
  }

  private extractScheduleSignal(message: string) {
    const normalized = this.normalize(message);
    const now = new Date();
    if (/amanha|amanhã/.test(normalized)) return { preferredDate: new Date(now.getTime() + 24 * 60 * 60 * 1000), preferredTime: this.extractTimeToken(message) };
    if (/hoje/.test(normalized)) return { preferredDate: now, preferredTime: this.extractTimeToken(message) };
    const dayMatch = normalized.match(/(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?/);
    if (!dayMatch) return null;
    const year = dayMatch[3] ? Number(dayMatch[3].length === 2 ? `20${dayMatch[3]}` : dayMatch[3]) : now.getFullYear();
    return { preferredDate: new Date(year, Number(dayMatch[2]) - 1, Number(dayMatch[1]), 10, 0, 0), preferredTime: this.extractTimeToken(message) };
  }

  private extractTimeToken(message: string) {
    const match = message.match(/(\d{1,2})(?::(\d{2}))?\s?(h|hrs|horas)?/i);
    if (!match) return null;
    return `${match[1].padStart(2, '0')}:${(match[2] ?? '00').padStart(2, '0')}`;
  }

  private async pickSeller(shopId: string) {
    const users = await this.usersRepository.find({ where: { shopId, isActive: true }, order: { createdAt: 'ASC' } });
    return users.find((user) => user.roles.some((role) => ['Seller', 'ShopSeller', 'Admin', 'ShopOwner'].includes(role))) ?? users[0] ?? null;
  }
  private async refreshSummary(session: ChatSessionState) {
    const recentMessages = session.messages.slice(-8).map((message) => `${message.autor}: ${message.texto}`);
    const profile = session.customerProfile;
    const summaryParts = [
      profile.name ? `cliente:${profile.name}` : null,
      profile.city ? `cidade:${profile.city}` : null,
      profile.budgetMin ? `orcamento_min:${profile.budgetMin}` : null,
      profile.budgetMax ? `orcamento_max:${profile.budgetMax}` : null,
      profile.preferredCategories.length ? `categorias:${profile.preferredCategories.join(',')}` : null,
      profile.preferredBrands.length ? `marcas:${profile.preferredBrands.join(',')}` : null,
      profile.preferredFuelTypes.length ? `combustivel:${profile.preferredFuelTypes.join(',')}` : null,
      profile.preferredTransmissions.length ? `cambio:${profile.preferredTransmissions.join(',')}` : null,
      profile.desiredUses.length ? `uso:${profile.desiredUses.join(',')}` : null,
      session.lastRecommendedVehicleIds.length ? `recomendados:${session.lastRecommendedVehicleIds.join(',')}` : null,
      `mensagens_recentes:${recentMessages.join(' | ')}`,
    ].filter(Boolean);
    return summaryParts.join(' ; ').slice(0, 2000);
  }

  private async streamReply(sessionId: string, reply: ChatReply, telemetry: ChatTelemetrySnapshot) {
    this.publishStream(sessionId, 'reply.started', { replyId: reply.id, toolsUsed: telemetry.toolsUsed });
    const chunks = reply.message.split(/(?<=[.!?])\s+/).map((chunk) => chunk.trim()).filter(Boolean);
    for (let index = 0; index < chunks.length; index += 1) this.publishStream(sessionId, 'reply.chunk', { replyId: reply.id, index, content: chunks[index] });
    this.publishStream(sessionId, 'reply.completed', reply);
  }

  private getStreamChannel(sessionId: string) {
    if (!this.streamChannels.has(sessionId)) this.streamChannels.set(sessionId, new Subject<MessageEvent>());
    return this.streamChannels.get(sessionId)!;
  }

  private publishStream(sessionId: string, type: string, data: unknown) {
    this.getStreamChannel(sessionId).next({ type, data: (typeof data === 'string' || (typeof data === 'object' && data !== null)) ? data : String(data) });
  }

  private buildShopScope(user: JwtUser): { shopId?: string } {
    return user.shopId ? { shopId: user.shopId } : {};
  }

  private ensureSessionAccess(session: ChatSessionEntity, user: JwtUser) {
    if (!user.shopId) return;
    if (session.shopId !== user.shopId) {
      throw new ForbiddenException('Sessao fora do escopo da loja do usuario.');
    }
  }

  private async logTelemetry(sessionId: string, type: string, message: string, payload?: Record<string, unknown>, level: 'info' | 'warning' | 'error' = 'info') {
    await this.chatTelemetryRepository.save(this.chatTelemetryRepository.create({ sessionId, type, level, message, payload: payload ?? null }));
  }

  private mergeExtractedProfile(session: ChatSessionState, message: string) {
    const profile = session.customerProfile;
    const normalized = this.normalize(message);
    const nameMatch = message.match(/(?:meu nome e|meu nome é|me chamo|sou o|sou a)\s+([a-zà-ú'\s]{2,60})/i);
    if (nameMatch) profile.name = this.toTitleCase(nameMatch[1].trim());
    const emailMatch = message.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
    if (emailMatch) profile.email = emailMatch[0].toLowerCase();
    const phoneMatch = message.match(/(?:\+55\s?)?(?:\(?\d{2}\)?\s?)?(?:9\d{4}|\d{4})-?\d{4}/);
    if (phoneMatch) profile.phone = phoneMatch[0];
    const plateMatch = message.match(/[A-Z]{3}[0-9][A-Z0-9][0-9]{2}/i);
    if (plateMatch) profile.plate = plateMatch[0].toUpperCase();
    const budget = this.extractBudgetRange(message);
    if (budget.max) profile.budgetMax = budget.max;
    if (budget.min) profile.budgetMin = budget.min;
    profile.preferredCategories = this.mergeUnique(profile.preferredCategories, this.extractCategories(normalized));
    profile.preferredBrands = this.mergeUnique(profile.preferredBrands, this.extractBrands(message));
    profile.preferredFuelTypes = this.mergeUnique(profile.preferredFuelTypes, this.extractFuelTypes(normalized));
    profile.preferredTransmissions = this.mergeUnique(profile.preferredTransmissions, this.extractTransmissions(normalized));
    profile.desiredUses = this.mergeUnique(profile.desiredUses, this.extractDesiredUses(normalized));
    profile.city = profile.city ?? this.extractCity(message);
    session.keywords = this.mergeUnique(session.keywords, [...profile.preferredCategories, ...profile.preferredBrands, ...profile.desiredUses].map((item) => this.toKeyword(item)));
  }

  private extractBudgetRange(message: string) {
    const normalized = this.normalize(message);
    const results: { min: number | null; max: number | null } = { min: null, max: null };
    const maxMatch = normalized.match(/(?:ate|até)\s*(?:r\$)?\s*(\d+[\d\.,]*)(?:\s*mil)?/i);
    if (maxMatch) results.max = this.parseMoneyToken(maxMatch[1], maxMatch[0].includes('mil'));
    const betweenMatch = normalized.match(/(?:entre|de)\s*(?:r\$)?\s*(\d+[\d\.,]*)(?:\s*mil)?\s*(?:e|a|ate|até)\s*(?:r\$)?\s*(\d+[\d\.,]*)(?:\s*mil)?/i);
    if (betweenMatch) {
      results.min = this.parseMoneyToken(betweenMatch[1], betweenMatch[0].includes('mil'));
      results.max = this.parseMoneyToken(betweenMatch[2], betweenMatch[0].includes('mil'));
    }
    if (!results.max) {
      const singleBudget = normalized.match(/(?:r\$\s*)?(\d{2,3})(?:\s*mil|k)\b/i);
      if (singleBudget) results.max = Number(singleBudget[1]) * 1000;
    }
    return results;
  }

  private parseMoneyToken(token: string, hasMilWord: boolean) {
    const digits = token.replace(/\./g, '').replace(',', '.');
    const numeric = Number(digits);
    if (!Number.isFinite(numeric)) return null;
    if (hasMilWord || numeric < 1000) return numeric * 1000;
    return numeric;
  }

  private extractCategories(normalized: string) {
    return ['SUV', 'Sedan', 'Hatch', 'Pickup', 'Caminhonete', 'Familia', 'Economico', 'Premium'].filter((category) => normalized.includes(this.normalize(category)));
  }

  private extractBrands(message: string) {
    const brands = ['Volkswagen', 'Chevrolet', 'Fiat', 'Toyota', 'Honda', 'Hyundai', 'Jeep', 'BMW', 'Audi', 'Renault', 'Ford', 'Nissan', 'Mercedes'];
    const normalized = this.normalize(message);
    return brands.filter((brand) => normalized.includes(this.normalize(brand)));
  }

  private extractFuelTypes(normalized: string) {
    const fuelTypes = [
      { key: 'flex', value: 'Flex' },
      { key: 'diesel', value: 'Diesel' },
      { key: 'eletrico', value: 'Eletrico' },
      { key: 'hibrido', value: 'Hibrido' },
      { key: 'gasolina', value: 'Gasolina' },
    ];
    return fuelTypes.filter((item) => normalized.includes(item.key)).map((item) => item.value);
  }

  private extractTransmissions(normalized: string) {
    const transmissions = [
      { key: 'automatico', value: 'Automatico' },
      { key: 'manual', value: 'Manual' },
    ];
    return transmissions.filter((item) => normalized.includes(item.key)).map((item) => item.value);
  }

  private extractDesiredUses(normalized: string) {
    const uses = [
      { key: 'cidade', value: 'cidade' },
      { key: 'familia', value: 'familia' },
      { key: 'economico', value: 'economia' },
      { key: 'trabalho', value: 'trabalho' },
      { key: 'estrada', value: 'estrada' },
      { key: 'uber', value: 'trabalho' },
    ];
    return uses.filter((item) => normalized.includes(item.key)).map((item) => item.value);
  }

  private extractCity(message: string) {
    const cityMatch = message.match(/(?:moro em|sou de|cidade)\s+([a-zà-ú\s]{2,60})/i);
    return cityMatch ? this.toTitleCase(cityMatch[1].trim()) : null;
  }

  private normalize(value: string) {
    return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  }

  private mergeUnique(current: string[], incoming: Array<string | null | undefined>) {
    return Array.from(new Set([...current, ...incoming.filter((item): item is string => !!item)]));
  }

  private toKeyword(value: string) { return value.trim(); }
  private toTitleCase(value: string) { return value.toLowerCase().split(/\s+/).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' '); }
}



