
import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, IsNull, LessThan, MoreThanOrEqual, Repository } from 'typeorm';
import { JwtUser } from '../auth/jwt-user.interface';
import { ChatSessionEntity } from '../chat/entities/chat-session.entity';
import { ChatTelemetryEventEntity } from '../chat/entities/chat-telemetry-event.entity';
import { InventorySyncLogEntity } from '../inventory-sync/entities/inventory-sync-log.entity';
import { LeadEntity, LeadStatus } from '../leads/entities/lead.entity';
import { SaleClosureEntity, SaleOutcomeType } from '../sales/entities/sale-closure.entity';
import { ShopEntity } from '../shops/entities/shop.entity';
import { TestDriveEntity, TestDriveStatus } from '../test-drives/entities/test-drive.entity';
import { UserEntity } from '../users/entities/user.entity';
import { VehicleEntity } from '../vehicles/entities/vehicle.entity';

type KpiTone = 'ocean' | 'forest' | 'amber' | 'plum' | 'slate' | 'danger';
type AlertSeverity = 'info' | 'warning' | 'error';

@Injectable()
export class DashboardService {
  constructor(
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource,
    @InjectRepository(ShopEntity) private readonly shopsRepository: Repository<ShopEntity>,
    @InjectRepository(VehicleEntity) private readonly vehiclesRepository: Repository<VehicleEntity>,
    @InjectRepository(LeadEntity) private readonly leadsRepository: Repository<LeadEntity>,
    @InjectRepository(SaleClosureEntity) private readonly saleClosuresRepository: Repository<SaleClosureEntity>,
    @InjectRepository(TestDriveEntity) private readonly testDrivesRepository: Repository<TestDriveEntity>,
    @InjectRepository(UserEntity) private readonly usersRepository: Repository<UserEntity>,
    @InjectRepository(InventorySyncLogEntity) private readonly inventorySyncLogsRepository: Repository<InventorySyncLogEntity>,
    @InjectRepository(ChatSessionEntity) private readonly chatSessionsRepository: Repository<ChatSessionEntity>,
    @InjectRepository(ChatTelemetryEventEntity) private readonly chatTelemetryRepository: Repository<ChatTelemetryEventEntity>,
  ) {}

  async getDashboardForUser(user: JwtUser, periodDaysRaw?: string, sellerId?: string, leadOrigin?: string) {
    if (this.isSystemAdmin(user)) return this.getSystemDashboard(user, periodDaysRaw);
    if (this.isShopAdmin(user)) return this.getShopDashboard(user, periodDaysRaw, sellerId, leadOrigin);
    return this.getSellerDashboard(user, periodDaysRaw);
  }

  async getSystemDashboard(user: JwtUser, periodDaysRaw?: string) {
    this.ensureSystemAdmin(user);

    const periodDays = this.resolvePeriodDays(periodDaysRaw);
    const now = new Date();
    const todayStart = this.startOfDay(now);
    const currentStart = this.daysAgo(periodDays - 1);
    const previousStart = this.daysAgo(periodDays * 2 - 1);
    const previousEnd = this.daysAgo(periodDays);
    const chartDays = this.resolveChartDays(periodDays);
    const chartStart = this.daysAgo(chartDays - 1);
    const syncAlertLimit = this.hoursAgo(12);

    const [
      totalShops,
      activeShops,
      totalVehicles,
      activeVehicles,
      totalLeads,
      previousLeads,
      totalTestDrives,
      previousTestDrives,
      sessions,
      previousSessions,
      telemetryCurrent,
      telemetryPrevious,
      totalSyncRuns,
      previousSyncRuns,
      successSyncCount,
      errorSyncCount,
      shopsWithoutOwner,
      shopsWithoutSync,
      staleSyncShops,
      errorSyncShops,
      shopsWithinSla,
      avgSyncDurationCurrent,
      avgSyncDurationPrevious,
      shopLeadRanking,
      shopTestDriveRanking,
      topShopsByStock,
      salesByShop,
      noSalesByShop,
      leadChart,
      testDriveChart,
      sessionChart,
      recentSyncLogs,
      latestSyncStatuses,
      slaByShop,
      leadsToday,
    ] = await Promise.all([
      this.shopsRepository.count({ where: { isDeleted: false } }),
      this.shopsRepository.count({ where: { isDeleted: false, isActive: true } }),
      this.vehiclesRepository.count(),
      this.vehiclesRepository.count({ where: { isActive: true } }),
      this.leadsRepository.createQueryBuilder('lead').where('lead.createdAt >= :start', { start: currentStart }).getCount(),
      this.leadsRepository.createQueryBuilder('lead').where('lead.createdAt >= :start AND lead.createdAt < :end', { start: previousStart, end: previousEnd }).getCount(),
      this.testDrivesRepository.createQueryBuilder('testDrive').where('testDrive.createdAt >= :start', { start: currentStart }).getCount(),
      this.testDrivesRepository.createQueryBuilder('testDrive').where('testDrive.createdAt >= :start AND testDrive.createdAt < :end', { start: previousStart, end: previousEnd }).getCount(),
      this.chatSessionsRepository.createQueryBuilder('session').where('session.createdAt >= :start', { start: currentStart }).getCount(),
      this.chatSessionsRepository.createQueryBuilder('session').where('session.createdAt >= :start AND session.createdAt < :end', { start: previousStart, end: previousEnd }).getCount(),
      this.chatTelemetryRepository.createQueryBuilder('event').where('event.createdAt >= :start', { start: currentStart }).getCount(),
      this.chatTelemetryRepository.createQueryBuilder('event').where('event.createdAt >= :start AND event.createdAt < :end', { start: previousStart, end: previousEnd }).getCount(),
      this.inventorySyncLogsRepository.createQueryBuilder('log').where('log.startedAt >= :start', { start: currentStart }).getCount(),
      this.inventorySyncLogsRepository.createQueryBuilder('log').where('log.startedAt >= :start AND log.startedAt < :end', { start: previousStart, end: previousEnd }).getCount(),
      this.inventorySyncLogsRepository.count({ where: { status: 'success' } }),
      this.inventorySyncLogsRepository.count({ where: { status: 'error' } }),
      this.shopsRepository.count({ where: { isDeleted: false, ownerId: IsNull() } }),
      this.shopsRepository.count({ where: { isDeleted: false, inventorySyncEnabled: false } }),
      this.shopsRepository.count({ where: { isDeleted: false, inventorySyncEnabled: true, inventoryLastSyncAt: LessThan(syncAlertLimit) } }),
      this.shopsRepository.count({ where: { isDeleted: false, inventoryLastSyncStatus: 'error' } }),
      this.shopsRepository.count({ where: { isDeleted: false, inventorySyncEnabled: true, inventoryLastSyncAt: MoreThanOrEqual(syncAlertLimit), inventoryLastSyncStatus: 'success' } }),
      this.averageSyncDuration(currentStart),
      this.averageSyncDuration(previousStart, previousEnd),
      this.aggregateShopsByMetric('lead', currentStart),
      this.aggregateShopsByMetric('testDrive', currentStart),
      this.aggregateShopsByStock(),
      this.aggregateSalesByShop(currentStart, SaleOutcomeType.Sale),
      this.aggregateSalesByShop(currentStart, SaleOutcomeType.NoSale),
      this.countByDay(this.leadsRepository, 'lead', 'createdAt', chartStart),
      this.countByDay(this.testDrivesRepository, 'testDrive', 'createdAt', chartStart),
      this.countByDay(this.chatSessionsRepository, 'session', 'createdAt', chartStart),
      this.inventorySyncLogsRepository.find({ order: { startedAt: 'DESC' }, take: 8 }),
      this.fetchLatestSyncStatuses(),
      this.buildSystemSlaByShop(syncAlertLimit),
      this.leadsRepository.createQueryBuilder('lead').where('lead.createdAt >= :todayStart', { todayStart }).getCount(),
    ]);

    const syncEnabledShops = Math.max(totalShops - shopsWithoutSync, 0);
    const slaCompliance = syncEnabledShops > 0 ? Math.round((shopsWithinSla / syncEnabledShops) * 100) : 0;
    const previousSlaCompliance = syncEnabledShops > 0
      ? Math.round(((syncEnabledShops - staleSyncShops - errorSyncShops) / syncEnabledShops) * 100)
      : 0;
    const conversion = totalLeads > 0 ? Math.round((totalTestDrives / totalLeads) * 100) : 0;

    const alerts = [
      shopsWithoutOwner > 0 ? this.buildAlert('Governanca', `${shopsWithoutOwner} loja(s) sem responsavel definido.`, 'warning') : null,
      shopsWithoutSync > 0 ? this.buildAlert('Integracao', `${shopsWithoutSync} loja(s) ainda sem sincronizacao automatica.`, 'warning') : null,
      staleSyncShops > 0 ? this.buildAlert('SLA', `${staleSyncShops} loja(s) estao fora do SLA de sincronizacao.`, 'error') : null,
      errorSyncShops > 0 ? this.buildAlert('Integracao', `${errorSyncShops} loja(s) com erro na ultima sincronizacao.`, 'error') : null,
    ].filter(Boolean);

    return {
      role: 'system-admin',
      generatedAt: now.toISOString(),
      meta: this.buildMeta(periodDays),
      hero: {
        eyebrow: 'Controle global',
        title: 'Operacao da plataforma',
        description: 'Visao executiva de governanca, saude, integracoes e escala da operacao multi-loja.',
      },
      kpis: [
        this.buildKpi('Lojas ativas', activeShops, `${totalShops} cadastradas`, null, 'ocean'),
        this.buildKpi('Veiculos ativos', activeVehicles, `${totalVehicles} no total`, null, 'forest'),
        this.buildKpi(`Leads ${periodDays} dias`, totalLeads, 'comparado ao periodo anterior', this.calculateTrend(totalLeads, previousLeads), 'amber'),
        this.buildKpi(`Test drives ${periodDays} dias`, totalTestDrives, `${conversion}% de conversao lead -> test drive`, this.calculateTrend(totalTestDrives, previousTestDrives), 'plum'),
        this.buildKpi(`Sessoes IA ${periodDays} dias`, sessions, `${telemetryCurrent} eventos de telemetria`, this.calculateTrend(sessions, previousSessions), 'slate'),
        this.buildKpi('SLA de integracao', slaCompliance, `${shopsWithinSla} loja(s) dentro do SLA`, this.calculateTrend(slaCompliance, previousSlaCompliance), slaCompliance >= 85 ? 'forest' : 'danger', '%'),
      ],
      shortcuts: [
        { label: 'Lojas', route: '/loja-lista', icon: 'storefront' },
        { label: 'Integracoes', route: '/integracoes', icon: 'sync' },
        { label: 'Usuarios', route: '/usuarios-lista', icon: 'groups' },
        { label: 'Leads', route: '/lead-lista', icon: 'support_agent' },
      ],
      health: {
        aiEnabled: !!this.configService.get<string>('OPENAI_API_KEY'),
        aiModel: this.configService.get<string>('OPENAI_MODEL', 'gpt-5-mini'),
        databaseConnection: this.dataSource.isInitialized ? 'up' : 'down',
        uptimeMinutes: Math.round(process.uptime() / 60),
        memoryUsagePercent: this.resolveMemoryUsagePercent(),
      },
      comparisons: {
        currentPeriodLabel: `Ultimos ${periodDays} dias`,
        previousPeriodLabel: `${periodDays} dias anteriores`,
        leads: { current: totalLeads, previous: previousLeads },
        testDrives: { current: totalTestDrives, previous: previousTestDrives },
        sessions: { current: sessions, previous: previousSessions },
        syncRuns: { current: totalSyncRuns, previous: previousSyncRuns },
        telemetry: { current: telemetryCurrent, previous: telemetryPrevious },
      },
      sla: {
        targetHours: 12,
        cards: [
          { label: 'Dentro do SLA', value: shopsWithinSla, tone: 'forest' },
          { label: 'Fora do SLA', value: staleSyncShops, tone: staleSyncShops > 0 ? 'danger' : 'slate' },
          { label: 'Com erro', value: errorSyncShops, tone: errorSyncShops > 0 ? 'danger' : 'slate' },
          { label: 'Sync desativada', value: shopsWithoutSync, tone: shopsWithoutSync > 0 ? 'amber' : 'slate' },
        ],
        averageDurationMs: avgSyncDurationCurrent,
        averageDurationTrend: this.calculateTrend(avgSyncDurationCurrent, avgSyncDurationPrevious),
      },
      charts: {
        leadsByDay: this.fillSeries(leadChart, chartStart, chartDays),
        testDrivesByDay: this.fillSeries(testDriveChart, chartStart, chartDays),
        sessionsByDay: this.fillSeries(sessionChart, chartStart, chartDays),
        syncStatus: [
          { label: 'Sucesso', value: successSyncCount },
          { label: 'Erro', value: errorSyncCount },
        ],
      },
      rankings: {
        topShopsByLeads: shopLeadRanking,
        topShopsByTestDrives: shopTestDriveRanking,
        topShopsByStock,
        salesByShop,
        noSalesByShop,
      },
      alerts,
      integrations: {
        recentRuns: recentSyncLogs.map((item) => ({
          id: item.id,
          shopId: item.shopId,
          shopName: item.shopName,
          status: item.status,
          triggerType: item.triggerType,
          startedAt: item.startedAt.toISOString(),
          durationMs: item.durationMs,
          imported: item.imported,
          errorMessage: item.errorMessage,
        })),
        latestByShop: latestSyncStatuses,
        slaByShop,
      },
      summary: {
        leadsToday,
        pendingAttentionShops: staleSyncShops + errorSyncShops,
      },
    };
  }

  async getShopDashboard(user: JwtUser, periodDaysRaw?: string, sellerId?: string, leadOrigin?: string) {
    this.ensureShopAdmin(user);
    const shopId = user.shopId as string;
    const selectedSellerId = sellerId || undefined;
    const selectedLeadOrigin = leadOrigin?.trim() || undefined;
    const periodDays = this.resolvePeriodDays(periodDaysRaw);
    const now = new Date();
    const todayStart = this.startOfDay(now);
    const currentStart = this.daysAgo(periodDays - 1);
    const previousStart = this.daysAgo(periodDays * 2 - 1);
    const previousEnd = this.daysAgo(periodDays);
    const chartDays = this.resolveChartDays(periodDays);
    const chartStart = this.daysAgo(chartDays - 1);
    const staleInventoryDate = this.daysAgo(45);

    const [
      shop,
      leadsToday,
      leadsCurrent,
      leadsPrevious,
      leadsWithoutContact,
      activeStock,
      stockWithoutPhoto,
      stockWithoutPrice,
      staleStock,
      testDrivesPending,
      testDrivesCurrent,
      testDrivesPrevious,
      sessionsCurrent,
      sessionsPrevious,
      leadChart,
      testDriveChart,
      leadStatusRows,
      leadFunnelCounts,
      leadsBySeller,
      sellerRanking,
      salesBySeller,
      stockByBrand,
      recentLeads,
      upcomingTestDrives,
      integrationStatus,
      topDemandKeywords,
      overdueFollowUps,
      followUpsDueToday,
      wonLeadsCurrent,
      wonLeadsPrevious,
      leadOrigins,
      outcomeSummary,
    ] = await Promise.all([
      this.shopsRepository.findOne({ where: { id: shopId } }),
      this.countLeadsWithFilters(shopId, todayStart, undefined, selectedSellerId, selectedLeadOrigin),
      this.countLeadsWithFilters(shopId, currentStart, undefined, selectedSellerId, selectedLeadOrigin),
      this.countLeadsWithFilters(shopId, previousStart, previousEnd, selectedSellerId, selectedLeadOrigin),
      this.countLeadsWithoutContact(shopId, selectedSellerId, selectedLeadOrigin),
      this.vehiclesRepository.count({ where: { shopId, isActive: true } }),
      this.vehiclesRepository.createQueryBuilder('vehicle').where('vehicle.shopId = :shopId AND vehicle.isActive = true', { shopId }).andWhere('COALESCE(array_length(vehicle.originalPhotoUrls, 1), 0) = 0').getCount(),
      this.vehiclesRepository.createQueryBuilder('vehicle').where('vehicle.shopId = :shopId AND vehicle.isActive = true', { shopId }).andWhere('vehicle.price <= 0').getCount(),
      this.vehiclesRepository.createQueryBuilder('vehicle').where('vehicle.shopId = :shopId AND vehicle.isActive = true', { shopId }).andWhere('COALESCE(vehicle.sourceUpdatedAt, vehicle.updatedAt) < :staleInventoryDate', { staleInventoryDate }).getCount(),
      this.testDrivesRepository.count({ where: { shopId, status: TestDriveStatus.Pending } }),
      this.testDrivesRepository.createQueryBuilder('testDrive').where('testDrive.shopId = :shopId AND testDrive.createdAt >= :start', { shopId, start: currentStart }).getCount(),
      this.testDrivesRepository.createQueryBuilder('testDrive').where('testDrive.shopId = :shopId AND testDrive.createdAt >= :start AND testDrive.createdAt < :end', { shopId, start: previousStart, end: previousEnd }).getCount(),
      this.chatSessionsRepository.createQueryBuilder('session').where('session.shopId = :shopId AND session.createdAt >= :start', { shopId, start: currentStart }).getCount(),
      this.chatSessionsRepository.createQueryBuilder('session').where('session.shopId = :shopId AND session.createdAt >= :start AND session.createdAt < :end', { shopId, start: previousStart, end: previousEnd }).getCount(),
      this.countLeadsByDay(shopId, chartStart, selectedSellerId, selectedLeadOrigin),
      this.countByDay(this.testDrivesRepository, 'testDrive', 'createdAt', chartStart, 'testDrive.shopId = :shopId', { shopId }),
      this.aggregateLeadStatus(shopId, selectedSellerId, selectedLeadOrigin),
      this.getLeadFunnel(shopId, selectedSellerId, selectedLeadOrigin),
      this.aggregateLeadsBySeller(shopId, currentStart, selectedLeadOrigin),
      this.aggregateSellerPerformance(shopId, currentStart, selectedLeadOrigin),
      this.aggregateSalesBySeller(shopId, currentStart),
      this.aggregateStockByBrand(shopId),
      this.findRecentLeads(shopId, selectedSellerId, selectedLeadOrigin),
      this.testDrivesRepository.find({ where: { shopId }, relations: { vehicle: true, lead: true }, order: { preferredDate: 'ASC' }, take: 6 }),
      this.inventorySyncLogsRepository.findOne({ where: { shopId }, order: { startedAt: 'DESC' } }),
      this.aggregateShopKeywords(shopId),
      this.countOverdueFollowUpsByShop(shopId, selectedSellerId, selectedLeadOrigin),
      this.countFollowUpsDueTodayByShop(shopId, selectedSellerId, selectedLeadOrigin),
      this.countLeadsWithFilters(shopId, currentStart, undefined, selectedSellerId, selectedLeadOrigin, LeadStatus.Won),
      this.countLeadsWithFilters(shopId, previousStart, previousEnd, selectedSellerId, selectedLeadOrigin, LeadStatus.Won),
      this.listLeadOrigins(shopId),
      this.aggregateSaleOutcomeSummary(shopId, currentStart),
    ]);

    const alerts = [
      leadsWithoutContact > 0 ? this.buildAlert('Leads', `${leadsWithoutContact} lead(s) ainda sem primeiro contato.`, 'warning') : null,
      overdueFollowUps > 0 ? this.buildAlert('Follow-up', `${overdueFollowUps} follow-up(s) estao vencidos.`, 'error') : null,
      stockWithoutPhoto > 0 ? this.buildAlert('Estoque', `${stockWithoutPhoto} veiculo(s) ativos sem foto.`, 'warning') : null,
      stockWithoutPrice > 0 ? this.buildAlert('Estoque', `${stockWithoutPrice} veiculo(s) ativos sem preco valido.`, 'error') : null,
      staleStock > 0 ? this.buildAlert('Estoque', `${staleStock} veiculo(s) com estoque parado ha mais de 45 dias.`, 'warning') : null,
      integrationStatus?.status === 'error' ? this.buildAlert('Integracao', integrationStatus.errorMessage || 'A ultima sincronizacao da loja terminou com erro.', 'error') : null,
    ].filter(Boolean);

    const leadToTestDriveRate = leadsCurrent > 0 ? Math.round((testDrivesCurrent / leadsCurrent) * 100) : 0;

    return {
      role: 'shop-admin',
      generatedAt: now.toISOString(),
      meta: this.buildMeta(periodDays),
      hero: {
        eyebrow: 'Operacao da loja',
        title: shop?.name ?? user.shopName ?? 'Minha loja',
        description: 'Visao comercial e operacional da loja, com foco em leads, estoque, equipe e proximas acoes.',
      },
      filters: {
        periodDays,
        availablePeriods: [7, 30, 90],
        selectedSellerId: selectedSellerId ?? null,
        selectedLeadOrigin: selectedLeadOrigin ?? null,
        leadOrigins,
      },
      kpis: [
        this.buildKpi('Leads hoje', leadsToday, 'entradas no dia atual', null, 'ocean'),
        this.buildKpi('Leads sem contato', leadsWithoutContact, 'pedem acao imediata', null, leadsWithoutContact > 0 ? 'danger' : 'forest'),
        this.buildKpi('Follow-ups vencidos', overdueFollowUps, `${followUpsDueToday} previstos para hoje`, null, overdueFollowUps > 0 ? 'danger' : 'slate'),
        this.buildKpi('Test drives pendentes', testDrivesPending, 'agendamentos aguardando confirmacao', null, 'plum'),
        this.buildKpi('Estoque ativo', activeStock, `${staleStock} parados ha mais de 45 dias`, null, 'forest'),
        this.buildKpi(`Leads ${periodDays} dias`, leadsCurrent, 'comparado ao periodo anterior', this.calculateTrend(leadsCurrent, leadsPrevious), 'amber'),
        this.buildKpi(`Sessoes IA ${periodDays} dias`, sessionsCurrent, 'engajamento do canal conversacional', this.calculateTrend(sessionsCurrent, sessionsPrevious), 'slate'),
        this.buildKpi('Conversao lead -> test drive', leadToTestDriveRate, `${testDrivesCurrent} test drives no periodo`, this.calculateTrend(testDrivesCurrent, testDrivesPrevious), 'plum', '%'),
      ],
      shortcuts: [
        { label: 'Estoque', route: '/estoque', icon: 'directions_car' },
        { label: 'Leads', route: '/lead-lista', icon: 'support_agent' },
        { label: 'Test drives', route: '/test-drive-list', icon: 'event_available' },
        { label: 'Perfil da loja', route: '/perfil', icon: 'store' },
      ],
      comparisons: {
        currentPeriodLabel: `Ultimos ${periodDays} dias`,
        previousPeriodLabel: `${periodDays} dias anteriores`,
        leads: { current: leadsCurrent, previous: leadsPrevious },
        testDrives: { current: testDrivesCurrent, previous: testDrivesPrevious },
        wonLeads: { current: wonLeadsCurrent, previous: wonLeadsPrevious },
        sessions: { current: sessionsCurrent, previous: sessionsPrevious },
      },
      charts: {
        leadsByDay: this.fillSeries(leadChart, chartStart, chartDays),
        testDrivesByDay: this.fillSeries(testDriveChart, chartStart, chartDays),
        leadStatusDistribution: leadStatusRows,
        leadsBySeller,
        stockByBrand,
        funnel: leadFunnelCounts,
        salesBySeller,
      },
      sellerRanking,
      sales: outcomeSummary,
      ai: {
        sessions30d: sessionsCurrent,
        topKeywords: topDemandKeywords,
      },
      alerts,
      pending: {
        recentLeads: recentLeads.map((lead) => ({
          id: lead.id,
          customerName: lead.name,
          status: lead.status,
          sellerName: lead.seller?.userName ?? null,
          vehicleLabel: lead.vehicle ? `${lead.vehicle.brand} ${lead.vehicle.model}` : null,
          createdAt: lead.createdAt.toISOString(),
          hasBeenContacted: lead.hasBeenContacted,
        })),
        upcomingTestDrives: upcomingTestDrives.map((item) => ({
          id: item.id,
          customerName: item.customerName,
          status: item.status,
          vehicleLabel: item.vehicle ? `${item.vehicle.brand} ${item.vehicle.model}` : null,
          preferredDate: item.preferredDate.toISOString(),
          preferredTime: item.preferredTime,
        })),
      },
      inventory: { withoutPhoto: stockWithoutPhoto, withoutPrice: stockWithoutPrice, staleStock },
      integration: integrationStatus
        ? {
            status: integrationStatus.status,
            startedAt: integrationStatus.startedAt.toISOString(),
            imported: integrationStatus.imported,
            updated: integrationStatus.updated,
            durationMs: integrationStatus.durationMs,
            errorMessage: integrationStatus.errorMessage,
          }
        : null,
    };
  }

  async getSellerDashboard(user: JwtUser, periodDaysRaw?: string) {
    this.ensureSellerScope(user);
    const sellerId = user.userId;
    const shopId = user.shopId as string;
    const periodDays = this.resolvePeriodDays(periodDaysRaw);
    const now = new Date();
    const todayStart = this.startOfDay(now);
    const currentStart = this.daysAgo(periodDays - 1);
    const previousStart = this.daysAgo(periodDays * 2 - 1);
    const previousEnd = this.daysAgo(periodDays);
    const chartDays = this.resolveChartDays(periodDays);
    const chartStart = this.daysAgo(chartDays - 1);
    const monthStart = this.startOfMonth(now);

    const [
      shop,
      myLeadsCurrent,
      myLeadsPrevious,
      myNewLeads,
      myLeadsWithoutContact,
      myWonLeadsCurrent,
      myWonLeadsPrevious,
      myTestDrivesUpcoming,
      myTestDrivesCurrent,
      myTestDrivesPrevious,
      recentAssignedLeads,
      myUpcomingTestDrives,
      leadsByDay,
      leadStatusRows,
      overdueTasks,
      followUpsDueToday,
      monthlyLeads,
      monthlyWonLeads,
      monthlyTestDrives,
      monthlyContacted,
    ] = await Promise.all([
      this.shopsRepository.findOne({ where: { id: shopId } }),
      this.leadsRepository.count({ where: { sellerId, createdAt: MoreThanOrEqual(currentStart) } }),
      this.leadsRepository.createQueryBuilder('lead').where('lead.sellerId = :sellerId AND lead.createdAt >= :start AND lead.createdAt < :end', { sellerId, start: previousStart, end: previousEnd }).getCount(),
      this.leadsRepository.count({ where: { sellerId, createdAt: MoreThanOrEqual(todayStart) } }),
      this.leadsRepository.count({ where: { sellerId, hasBeenContacted: false, isActive: true } }),
      this.leadsRepository.count({ where: { sellerId, status: LeadStatus.Won, createdAt: MoreThanOrEqual(currentStart) } }),
      this.leadsRepository.createQueryBuilder('lead').where('lead.sellerId = :sellerId AND lead.status = :status AND lead.createdAt >= :start AND lead.createdAt < :end', { sellerId, status: LeadStatus.Won, start: previousStart, end: previousEnd }).getCount(),
      this.testDrivesRepository.createQueryBuilder('testDrive').leftJoin('testDrive.lead', 'lead').where('testDrive.shopId = :shopId', { shopId }).andWhere('lead.sellerId = :sellerId', { sellerId }).andWhere('testDrive.preferredDate >= :now', { now }).getCount(),
      this.testDrivesRepository.createQueryBuilder('testDrive').leftJoin('testDrive.lead', 'lead').where('testDrive.shopId = :shopId', { shopId }).andWhere('lead.sellerId = :sellerId', { sellerId }).andWhere('testDrive.createdAt >= :start', { start: currentStart }).getCount(),
      this.testDrivesRepository.createQueryBuilder('testDrive').leftJoin('testDrive.lead', 'lead').where('testDrive.shopId = :shopId', { shopId }).andWhere('lead.sellerId = :sellerId', { sellerId }).andWhere('testDrive.createdAt >= :start AND testDrive.createdAt < :end', { start: previousStart, end: previousEnd }).getCount(),
      this.leadsRepository.find({ where: { sellerId }, relations: { vehicle: true }, order: { createdAt: 'DESC' }, take: 6 }),
      this.testDrivesRepository.createQueryBuilder('testDrive').leftJoinAndSelect('testDrive.vehicle', 'vehicle').leftJoinAndSelect('testDrive.lead', 'lead').where('testDrive.shopId = :shopId', { shopId }).andWhere('lead.sellerId = :sellerId', { sellerId }).orderBy('testDrive.preferredDate', 'ASC').limit(6).getMany(),
      this.countByDay(this.leadsRepository, 'lead', 'createdAt', chartStart, 'lead.sellerId = :sellerId', { sellerId }),
      this.aggregateLeadStatus(shopId, sellerId),
      this.countOverdueFollowUpsBySeller(sellerId),
      this.countFollowUpsDueTodayBySeller(sellerId),
      this.leadsRepository.count({ where: { sellerId, createdAt: MoreThanOrEqual(monthStart) } }),
      this.leadsRepository.count({ where: { sellerId, status: LeadStatus.Won, createdAt: MoreThanOrEqual(monthStart) } }),
      this.testDrivesRepository.createQueryBuilder('testDrive').leftJoin('testDrive.lead', 'lead').where('lead.sellerId = :sellerId', { sellerId }).andWhere('testDrive.createdAt >= :start', { start: monthStart }).getCount(),
      this.leadsRepository.count({ where: { sellerId, hasBeenContacted: true, createdAt: MoreThanOrEqual(monthStart) } }),
    ]);

    const goals = this.resolveSellerGoals(shop?.settingsPreferences);
    const contactedRate = monthlyLeads > 0 ? Math.round((monthlyContacted / monthlyLeads) * 100) : 0;
    const alerts = [
      overdueTasks > 0 ? this.buildAlert('Follow-up', `${overdueTasks} tarefa(s) vencida(s) na sua fila.`, 'error') : null,
      myLeadsWithoutContact > 0 ? this.buildAlert('Leads', `${myLeadsWithoutContact} lead(s) sem primeiro contato.`, 'warning') : null,
      myTestDrivesUpcoming > 0 ? this.buildAlert('Agenda', `${myTestDrivesUpcoming} test drive(s) futuro(s) aguardando acompanhamento.`, 'info') : null,
    ].filter(Boolean);

    return {
      role: 'seller',
      generatedAt: now.toISOString(),
      meta: this.buildMeta(periodDays),
      hero: {
        eyebrow: 'Minha operacao',
        title: 'Painel do vendedor',
        description: 'Visao objetiva dos seus leads, follow-ups, metas do mes e agenda comercial.',
      },
      kpis: [
        this.buildKpi('Leads hoje', myNewLeads, 'novas entradas sob sua responsabilidade', null, 'ocean'),
        this.buildKpi(`Leads ${periodDays} dias`, myLeadsCurrent, 'volume pessoal recente', this.calculateTrend(myLeadsCurrent, myLeadsPrevious), 'amber'),
        this.buildKpi('Sem contato', myLeadsWithoutContact, 'pedem retorno agora', null, myLeadsWithoutContact > 0 ? 'danger' : 'forest'),
        this.buildKpi('Follow-ups vencidos', overdueTasks, `${followUpsDueToday} previsto(s) para hoje`, null, overdueTasks > 0 ? 'danger' : 'slate'),
        this.buildKpi('Test drives futuros', myTestDrivesUpcoming, 'agenda a acompanhar', null, 'plum'),
        this.buildKpi(`Ganhos ${periodDays} dias`, myWonLeadsCurrent, 'conversoes registradas', this.calculateTrend(myWonLeadsCurrent, myWonLeadsPrevious), 'forest'),
      ],
      shortcuts: [
        { label: 'Meus leads', route: '/lead-lista', icon: 'support_agent' },
        { label: 'Test drives', route: '/test-drive-list', icon: 'event_available' },
        { label: 'Estoque', route: '/estoque', icon: 'directions_car' },
        { label: 'Perfil', route: '/perfil', icon: 'badge' },
      ],
      alerts,
      comparisons: {
        currentPeriodLabel: `Ultimos ${periodDays} dias`,
        previousPeriodLabel: `${periodDays} dias anteriores`,
        leads: { current: myLeadsCurrent, previous: myLeadsPrevious },
        testDrives: { current: myTestDrivesCurrent, previous: myTestDrivesPrevious },
        wonLeads: { current: myWonLeadsCurrent, previous: myWonLeadsPrevious },
      },
      charts: {
        leadsByDay: this.fillSeries(leadsByDay, chartStart, chartDays),
        leadStatusDistribution: leadStatusRows,
      },
      tasks: {
        myLeadsWithoutContact,
        upcomingTestDrives: myTestDrivesUpcoming,
        overdueFollowUps: overdueTasks,
        followUpsDueToday,
        recentAssignedLeads: recentAssignedLeads.map((lead) => ({
          id: lead.id,
          customerName: lead.name,
          status: lead.status,
          vehicleLabel: lead.vehicle ? `${lead.vehicle.brand} ${lead.vehicle.model}` : null,
          createdAt: lead.createdAt.toISOString(),
          hasBeenContacted: lead.hasBeenContacted,
        })),
        myUpcomingTestDrives: myUpcomingTestDrives.map((item) => ({
          id: item.id,
          customerName: item.customerName,
          status: item.status,
          vehicleLabel: item.vehicle ? `${item.vehicle.brand} ${item.vehicle.model}` : null,
          preferredDate: item.preferredDate.toISOString(),
          preferredTime: item.preferredTime,
        })),
      },
      goals: {
        monthLabel: this.formatMonthYear(now),
        cards: [
          this.buildGoalCard('Meta de leads', monthlyLeads, goals.leadsTarget),
          this.buildGoalCard('Meta de test drives', monthlyTestDrives, goals.testDrivesTarget),
          this.buildGoalCard('Meta de ganhos', monthlyWonLeads, goals.wonLeadsTarget),
          this.buildGoalCard('Meta de contato', contactedRate, goals.contactedRateTarget, '%'),
        ],
      },
    };
  }

  private async aggregateShopsByMetric(metric: 'lead' | 'testDrive', start?: Date) {
    const repository = metric === 'lead' ? this.leadsRepository : this.testDrivesRepository;
    const alias = metric === 'lead' ? 'lead' : 'testDrive';

    const qb = repository.createQueryBuilder(alias)
      .leftJoin(`${alias}.shop`, 'shop')
      .select(`${alias}.shopId`, 'shopId')
      .addSelect(`COALESCE(shop.name, 'Sem loja')`, 'shopName')
      .addSelect('COUNT(*)::int', 'value');

    if (start) {
      qb.where(`${alias}.createdAt >= :start`, { start });
    }

    const rows = await qb
      .groupBy(`${alias}.shopId`)
      .addGroupBy('shop.name')
      .orderBy('value', 'DESC')
      .limit(6)
      .getRawMany<{ shopId: string | null; shopName: string; value: string }>();

    return rows.map((row) => ({ shopId: row.shopId, shopName: row.shopName, value: Number(row.value) }));
  }

  private async aggregateShopsByStock() {
    const rows = await this.vehiclesRepository.createQueryBuilder('vehicle')
      .leftJoin('vehicle.shop', 'shop')
      .select('vehicle.shopId', 'shopId')
      .addSelect(`COALESCE(shop.name, 'Sem loja')`, 'shopName')
      .addSelect('COUNT(*)::int', 'value')
      .where('vehicle.isActive = true')
      .groupBy('vehicle.shopId')
      .addGroupBy('shop.name')
      .orderBy('value', 'DESC')
      .limit(6)
      .getRawMany<{ shopId: string | null; shopName: string; value: string }>();

    return rows.map((row) => ({ shopId: row.shopId, shopName: row.shopName, value: Number(row.value) }));
  }

  private async aggregateSalesByShop(start: Date, outcomeType: SaleOutcomeType) {
    const rows = await this.saleClosuresRepository.createQueryBuilder('sale')
      .leftJoin('sale.shop', 'shop')
      .select('sale.shopId', 'shopId')
      .addSelect(`COALESCE(shop.name, 'Sem loja')`, 'shopName')
      .addSelect('COUNT(*)::int', 'value')
      .where('sale.closedAt >= :start', { start })
      .andWhere('sale.outcomeType = :outcomeType', { outcomeType })
      .groupBy('sale.shopId')
      .addGroupBy('shop.name')
      .orderBy('value', 'DESC')
      .limit(6)
      .getRawMany<{ shopId: string | null; shopName: string; value: string }>();

    return rows.map((row) => ({ shopId: row.shopId, shopName: row.shopName, value: Number(row.value) }));
  }

  private async aggregateLeadStatus(shopId: string, sellerId?: string, leadOrigin?: string) {
    const qb = this.leadsRepository.createQueryBuilder('lead')
      .select('lead.status', 'label')
      .addSelect('COUNT(*)::int', 'value')
      .where('lead.shopId = :shopId', { shopId });

    if (sellerId) {
      qb.andWhere('lead.sellerId = :sellerId', { sellerId });
    }
    if (leadOrigin) {
      qb.andWhere('lead.origin = :leadOrigin', { leadOrigin });
    }

    const rows = await qb.groupBy('lead.status').orderBy('value', 'DESC').getRawMany<{ label: LeadStatus; value: string }>();
    return rows.map((row) => ({ label: row.label, value: Number(row.value) }));
  }

  private async aggregateLeadsBySeller(shopId: string, start?: Date, leadOrigin?: string) {
    const qb = this.leadsRepository.createQueryBuilder('lead')
      .leftJoin('lead.seller', 'seller')
      .select(`COALESCE(seller.userName, 'Sem vendedor')`, 'label')
      .addSelect('COUNT(*)::int', 'value')
      .where('lead.shopId = :shopId', { shopId });

    if (start) {
      qb.andWhere('lead.createdAt >= :start', { start });
    }
    if (leadOrigin) {
      qb.andWhere('lead.origin = :leadOrigin', { leadOrigin });
    }

    const rows = await qb.groupBy('seller.userName').orderBy('value', 'DESC').limit(8).getRawMany<{ label: string; value: string }>();
    return rows.map((row) => ({ label: row.label, value: Number(row.value) }));
  }

  private async aggregateSellerPerformance(shopId: string, start: Date, leadOrigin?: string) {
    const leadsRows = await this.leadsRepository.createQueryBuilder('lead')
      .leftJoin('lead.seller', 'seller')
      .select('lead.sellerId', 'sellerId')
      .addSelect(`COALESCE(seller.userName, 'Sem vendedor')`, 'sellerName')
      .addSelect('COUNT(*)::int', 'leads')
      .addSelect(`SUM(CASE WHEN lead.status = :wonStatus THEN 1 ELSE 0 END)::int`, 'wonLeads')
      .where('lead.shopId = :shopId', { shopId })
      .andWhere('lead.createdAt >= :start', { start })
      .setParameter('wonStatus', LeadStatus.Won)
      .groupBy('lead.sellerId')
      .addGroupBy('seller.userName')
      .orderBy('leads', 'DESC')
      .getRawMany<{ sellerId: string | null; sellerName: string; leads: string; wonLeads: string }>();

    if (leadOrigin) {
      const filteredRows = await this.leadsRepository.createQueryBuilder('lead')
        .leftJoin('lead.seller', 'seller')
        .select('lead.sellerId', 'sellerId')
        .addSelect(`COALESCE(seller.userName, 'Sem vendedor')`, 'sellerName')
        .addSelect('COUNT(*)::int', 'leads')
        .addSelect(`SUM(CASE WHEN lead.status = :wonStatus THEN 1 ELSE 0 END)::int`, 'wonLeads')
        .where('lead.shopId = :shopId', { shopId })
        .andWhere('lead.createdAt >= :start', { start })
        .andWhere('lead.origin = :leadOrigin', { leadOrigin })
        .setParameter('wonStatus', LeadStatus.Won)
        .groupBy('lead.sellerId')
        .addGroupBy('seller.userName')
        .orderBy('leads', 'DESC')
        .getRawMany<{ sellerId: string | null; sellerName: string; leads: string; wonLeads: string }>();
      leadsRows.splice(0, leadsRows.length, ...filteredRows);
    }

    const testDriveRows = await this.testDrivesRepository.createQueryBuilder('testDrive')
      .leftJoin('testDrive.lead', 'lead')
      .select('lead.sellerId', 'sellerId')
      .addSelect('COUNT(*)::int', 'testDrives')
      .where('testDrive.shopId = :shopId', { shopId })
      .andWhere('testDrive.createdAt >= :start', { start })
      .groupBy('lead.sellerId')
      .getRawMany<{ sellerId: string | null; testDrives: string }>();

    const testDriveMap = new Map(testDriveRows.map((row) => [row.sellerId ?? 'none', Number(row.testDrives)]));

    return leadsRows
      .map((row) => {
        const leads = Number(row.leads);
        const wonLeads = Number(row.wonLeads);
        const testDrives = testDriveMap.get(row.sellerId ?? 'none') ?? 0;
        const conversionRate = leads > 0 ? Math.round((wonLeads / leads) * 100) : 0;

        return {
          sellerId: row.sellerId,
          sellerName: row.sellerName,
          leads,
          testDrives,
          wonLeads,
          conversionRate,
        };
      })
      .sort((left, right) => right.conversionRate - left.conversionRate || right.leads - left.leads)
      .slice(0, 8);
  }

  private async aggregateSalesBySeller(shopId: string, start: Date) {
    const rows = await this.saleClosuresRepository.createQueryBuilder('sale')
      .leftJoin('sale.seller', 'seller')
      .select(`COALESCE(seller.userName, 'Sem vendedor')`, 'label')
      .addSelect(`SUM(CASE WHEN sale.outcomeType = :saleOutcome THEN 1 ELSE 0 END)::int`, 'sales')
      .addSelect(`SUM(CASE WHEN sale.outcomeType = :noSaleOutcome THEN 1 ELSE 0 END)::int`, 'noSales')
      .where('sale.shopId = :shopId', { shopId })
      .andWhere('sale.closedAt >= :start', { start })
      .setParameters({ saleOutcome: SaleOutcomeType.Sale, noSaleOutcome: SaleOutcomeType.NoSale })
      .groupBy('seller.userName')
      .orderBy('sales', 'DESC')
      .getRawMany<{ label: string; sales: string; noSales: string }>();

    return rows.map((row) => ({
      label: row.label,
      sales: Number(row.sales),
      noSales: Number(row.noSales),
      value: Number(row.sales),
    }));
  }

  private async aggregateStockByBrand(shopId: string) {
    const rows = await this.vehiclesRepository.createQueryBuilder('vehicle')
      .select('vehicle.brand', 'label')
      .addSelect('COUNT(*)::int', 'value')
      .where('vehicle.shopId = :shopId AND vehicle.isActive = true', { shopId })
      .groupBy('vehicle.brand')
      .orderBy('value', 'DESC')
      .limit(8)
      .getRawMany<{ label: string; value: string }>();

    return rows.map((row) => ({ label: row.label, value: Number(row.value) }));
  }

  private async aggregateShopKeywords(shopId: string) {
    const rows = await this.chatSessionsRepository.createQueryBuilder('session')
      .select('unnest(session.keywords)', 'label')
      .addSelect('COUNT(*)::int', 'value')
      .where('session.shopId = :shopId', { shopId })
      .groupBy('label')
      .orderBy('value', 'DESC')
      .limit(8)
      .getRawMany<{ label: string; value: string }>();

    return rows.map((row) => ({ label: row.label, value: Number(row.value) }));
  }

  private async getLeadFunnel(shopId: string, sellerId?: string, leadOrigin?: string) {
    const [newCount, contactedCount, qualifiedCount, negotiatingCount, wonCount] = await Promise.all([
      this.countLeadsWithFilters(shopId, undefined, undefined, sellerId, leadOrigin, LeadStatus.New),
      this.countLeadsContacted(shopId, sellerId, leadOrigin),
      this.countLeadsWithFilters(shopId, undefined, undefined, sellerId, leadOrigin, LeadStatus.Qualified),
      this.countLeadsWithFilters(shopId, undefined, undefined, sellerId, leadOrigin, LeadStatus.Negotiating),
      this.countLeadsWithFilters(shopId, undefined, undefined, sellerId, leadOrigin, LeadStatus.Won),
    ]);

    return [
      { label: 'Novos leads', value: newCount },
      { label: 'Contatados', value: contactedCount },
      { label: 'Qualificados', value: qualifiedCount },
      { label: 'Em negociacao', value: negotiatingCount },
      { label: 'Ganhos', value: wonCount },
    ];
  }

  private async fetchLatestSyncStatuses() {
    const rows = await this.inventorySyncLogsRepository.createQueryBuilder('log')
      .distinctOn(['log.shopId'])
      .orderBy('log.shopId', 'ASC')
      .addOrderBy('log.startedAt', 'DESC')
      .getMany();

    return rows.map((item) => ({
      shopId: item.shopId,
      shopName: item.shopName,
      status: item.status,
      startedAt: item.startedAt.toISOString(),
      errorMessage: item.errorMessage,
    }));
  }

  private async buildSystemSlaByShop(syncAlertLimit: Date) {
    const shops = await this.shopsRepository.find({
      where: { isDeleted: false },
      order: { name: 'ASC' },
    });

    return shops.map((shop) => {
      const hoursSinceLastSync = shop.inventoryLastSyncAt
        ? Math.max(Math.round((Date.now() - new Date(shop.inventoryLastSyncAt).getTime()) / 3600000), 0)
        : null;

      let slaStatus: 'ok' | 'warning' | 'error' | 'disabled' = 'ok';
      if (!shop.inventorySyncEnabled) {
        slaStatus = 'disabled';
      } else if (shop.inventoryLastSyncStatus === 'error') {
        slaStatus = 'error';
      } else if (!shop.inventoryLastSyncAt || shop.inventoryLastSyncAt < syncAlertLimit) {
        slaStatus = 'warning';
      }

      return {
        shopId: shop.id,
        shopName: shop.name,
        inventorySyncEnabled: shop.inventorySyncEnabled,
        lastSyncAt: shop.inventoryLastSyncAt?.toISOString() ?? null,
        lastSyncStatus: shop.inventoryLastSyncStatus ?? null,
        hoursSinceLastSync,
        slaStatus,
        lastSyncError: shop.inventoryLastSyncError ?? null,
      };
    });
  }

  private async averageSyncDuration(start: Date, end?: Date) {
    const qb = this.inventorySyncLogsRepository.createQueryBuilder('log')
      .select('COALESCE(AVG(log.durationMs), 0)', 'avg')
      .where('log.startedAt >= :start', { start });

    if (end) {
      qb.andWhere('log.startedAt < :end', { end });
    }

    const row = await qb.getRawOne<{ avg: string | null }>();
    return Math.round(Number(row?.avg ?? 0));
  }

  private async countOverdueFollowUpsByShop(shopId: string, sellerId?: string, leadOrigin?: string) {
    const qb = this.leadsRepository.createQueryBuilder('lead')
      .where('lead.shopId = :shopId', { shopId })
      .andWhere('lead.isActive = true')
      .andWhere(`(
        (lead.hasBeenContacted = false AND lead.createdAt < :firstContactLimit)
        OR
        (lead.hasBeenContacted = true AND lead.status IN (:...activeStatuses) AND COALESCE(lead.lastContactDate, lead.contactDate, lead.createdAt) < :followUpLimit)
      )`, {
        firstContactLimit: this.hoursAgo(24),
        activeStatuses: [LeadStatus.Contacted, LeadStatus.InProgress, LeadStatus.Qualified, LeadStatus.Negotiating],
        followUpLimit: this.daysAgo(3),
      });

    if (sellerId) qb.andWhere('lead.sellerId = :sellerId', { sellerId });
    if (leadOrigin) qb.andWhere('lead.origin = :leadOrigin', { leadOrigin });

    return qb.getCount();
  }

  private async countFollowUpsDueTodayByShop(shopId: string, sellerId?: string, leadOrigin?: string) {
    const qb = this.leadsRepository.createQueryBuilder('lead')
      .where('lead.shopId = :shopId', { shopId })
      .andWhere('lead.isActive = true')
      .andWhere('lead.hasBeenContacted = true')
      .andWhere('lead.status IN (:...activeStatuses)', { activeStatuses: [LeadStatus.Contacted, LeadStatus.InProgress, LeadStatus.Qualified, LeadStatus.Negotiating] })
      .andWhere('COALESCE(lead.lastContactDate, lead.contactDate, lead.createdAt) >= :from', { from: this.daysAgo(3) });

    if (sellerId) qb.andWhere('lead.sellerId = :sellerId', { sellerId });
    if (leadOrigin) qb.andWhere('lead.origin = :leadOrigin', { leadOrigin });

    return qb.getCount();
  }

  private async countOverdueFollowUpsBySeller(sellerId: string) {
    return this.leadsRepository.createQueryBuilder('lead')
      .where('lead.sellerId = :sellerId', { sellerId })
      .andWhere('lead.isActive = true')
      .andWhere(`(
        (lead.hasBeenContacted = false AND lead.createdAt < :firstContactLimit)
        OR
        (lead.hasBeenContacted = true AND lead.status IN (:...activeStatuses) AND COALESCE(lead.lastContactDate, lead.contactDate, lead.createdAt) < :followUpLimit)
      )`, {
        firstContactLimit: this.hoursAgo(24),
        activeStatuses: [LeadStatus.Contacted, LeadStatus.InProgress, LeadStatus.Qualified, LeadStatus.Negotiating],
        followUpLimit: this.daysAgo(3),
      })
      .getCount();
  }

  private async countFollowUpsDueTodayBySeller(sellerId: string) {
    return this.leadsRepository.createQueryBuilder('lead')
      .where('lead.sellerId = :sellerId', { sellerId })
      .andWhere('lead.isActive = true')
      .andWhere('lead.hasBeenContacted = true')
      .andWhere('lead.status IN (:...activeStatuses)', { activeStatuses: [LeadStatus.Contacted, LeadStatus.InProgress, LeadStatus.Qualified, LeadStatus.Negotiating] })
      .andWhere('COALESCE(lead.lastContactDate, lead.contactDate, lead.createdAt) >= :from', { from: this.daysAgo(3) })
      .getCount();
  }

  private async countLeadsWithFilters(
    shopId: string,
    start?: Date,
    end?: Date,
    sellerId?: string,
    leadOrigin?: string,
    status?: LeadStatus,
  ) {
    const qb = this.leadsRepository.createQueryBuilder('lead')
      .where('lead.shopId = :shopId', { shopId });

    if (start) qb.andWhere('lead.createdAt >= :start', { start });
    if (end) qb.andWhere('lead.createdAt < :end', { end });
    if (sellerId) qb.andWhere('lead.sellerId = :sellerId', { sellerId });
    if (leadOrigin) qb.andWhere('lead.origin = :leadOrigin', { leadOrigin });
    if (status) qb.andWhere('lead.status = :status', { status });

    return qb.getCount();
  }

  private async countLeadsWithoutContact(shopId: string, sellerId?: string, leadOrigin?: string) {
    const qb = this.leadsRepository.createQueryBuilder('lead')
      .where('lead.shopId = :shopId', { shopId })
      .andWhere('lead.hasBeenContacted = false')
      .andWhere('lead.isActive = true');

    if (sellerId) qb.andWhere('lead.sellerId = :sellerId', { sellerId });
    if (leadOrigin) qb.andWhere('lead.origin = :leadOrigin', { leadOrigin });

    return qb.getCount();
  }

  private async countLeadsContacted(shopId: string, sellerId?: string, leadOrigin?: string) {
    const qb = this.leadsRepository.createQueryBuilder('lead')
      .where('lead.shopId = :shopId', { shopId })
      .andWhere('lead.hasBeenContacted = true');

    if (sellerId) qb.andWhere('lead.sellerId = :sellerId', { sellerId });
    if (leadOrigin) qb.andWhere('lead.origin = :leadOrigin', { leadOrigin });

    return qb.getCount();
  }

  private async countLeadsByDay(shopId: string, start: Date, sellerId?: string, leadOrigin?: string) {
    const qb = this.leadsRepository.createQueryBuilder('lead')
      .select('DATE(lead.createdAt)', 'date')
      .addSelect('COUNT(*)::int', 'value')
      .where('lead.shopId = :shopId', { shopId })
      .andWhere('lead.createdAt >= :start', { start });

    if (sellerId) qb.andWhere('lead.sellerId = :sellerId', { sellerId });
    if (leadOrigin) qb.andWhere('lead.origin = :leadOrigin', { leadOrigin });

    const rows = await qb
      .groupBy('DATE(lead.createdAt)')
      .orderBy('DATE(lead.createdAt)', 'ASC')
      .getRawMany<{ date: string; value: string }>();

    return rows.map((row) => ({ date: row.date, value: Number(row.value) }));
  }

  private async findRecentLeads(shopId: string, sellerId?: string, leadOrigin?: string) {
    const qb = this.leadsRepository.createQueryBuilder('lead')
      .leftJoinAndSelect('lead.seller', 'seller')
      .leftJoinAndSelect('lead.vehicle', 'vehicle')
      .where('lead.shopId = :shopId', { shopId })
      .orderBy('lead.createdAt', 'DESC')
      .limit(6);

    if (sellerId) qb.andWhere('lead.sellerId = :sellerId', { sellerId });
    if (leadOrigin) qb.andWhere('lead.origin = :leadOrigin', { leadOrigin });

    return qb.getMany();
  }

  private async listLeadOrigins(shopId: string) {
    const rows = await this.leadsRepository.createQueryBuilder('lead')
      .select('lead.origin', 'origin')
      .where('lead.shopId = :shopId', { shopId })
      .andWhere('lead.origin IS NOT NULL')
      .groupBy('lead.origin')
      .orderBy('lead.origin', 'ASC')
      .getRawMany<{ origin: string }>();

    return rows.map((row) => row.origin).filter(Boolean);
  }

  private async aggregateSaleOutcomeSummary(shopId: string, start: Date) {
    const [sales, noSales] = await Promise.all([
      this.saleClosuresRepository.count({ where: { shopId, outcomeType: SaleOutcomeType.Sale, closedAt: MoreThanOrEqual(start) } }),
      this.saleClosuresRepository.count({ where: { shopId, outcomeType: SaleOutcomeType.NoSale, closedAt: MoreThanOrEqual(start) } }),
    ]);

    return { sales, noSales };
  }

  private async countByDay<T extends object>(
    repository: Repository<T>,
    alias: string,
    column: string,
    start: Date,
    extraWhere?: string,
    params?: Record<string, unknown>,
  ) {
    const qb = repository.createQueryBuilder(alias)
      .select(`DATE(${alias}.${column})`, 'date')
      .addSelect('COUNT(*)::int', 'value')
      .where(`${alias}.${column} >= :start`, { start });

    if (extraWhere) {
      qb.andWhere(extraWhere, params ?? {});
    }

    const rows = await qb.groupBy(`DATE(${alias}.${column})`).orderBy(`DATE(${alias}.${column})`, 'ASC').getRawMany<{ date: string; value: string }>();
    return rows.map((row) => ({ date: row.date, value: Number(row.value) }));
  }

  private fillSeries(items: Array<{ date: string; value: number }>, start: Date, days: number) {
    const lookup = new Map(items.map((item) => [item.date, item.value]));
    const series: Array<{ label: string; value: number }> = [];

    for (let index = 0; index < days; index += 1) {
      const current = new Date(start);
      current.setDate(start.getDate() + index);
      const key = current.toISOString().slice(0, 10);
      series.push({ label: key, value: lookup.get(key) ?? 0 });
    }

    return series;
  }

  private calculateTrend(current: number, previous: number) {
    if (previous <= 0) {
      return current > 0 ? { value: 100, direction: 'up' as const } : null;
    }

    const delta = Math.round(((current - previous) / previous) * 100);
    return { value: Math.abs(delta), direction: delta >= 0 ? ('up' as const) : ('down' as const) };
  }

  private buildKpi(
    label: string,
    value: number,
    detail: string,
    trend: { value: number; direction: 'up' | 'down' } | null,
    tone: KpiTone,
    suffix = '',
  ) {
    return { label, value: `${this.formatNumber(value)}${suffix}`, rawValue: value, detail, trend, tone };
  }

  private buildAlert(title: string, message: string, severity: AlertSeverity) {
    return { title, message, severity };
  }

  private buildGoalCard(label: string, current: number, target: number, suffix = '') {
    const progress = target > 0 ? Math.min(Math.round((current / target) * 100), 999) : 0;

    return {
      label,
      current,
      target,
      progress,
      currentLabel: `${this.formatNumber(current)}${suffix}`,
      targetLabel: `${this.formatNumber(target)}${suffix}`,
      tone: progress >= 100 ? 'forest' : progress >= 70 ? 'amber' : 'ocean',
    };
  }

  private buildMeta(periodDays: number) {
    return {
      periodDays,
      availablePeriods: [7, 30, 90],
    };
  }

  private resolveSellerGoals(settingsPreferences?: Record<string, unknown> | null) {
    const dashboardGoals = (settingsPreferences?.dashboardGoals as Record<string, unknown> | undefined) ?? {};

    return {
      leadsTarget: Number(dashboardGoals.sellerLeadsTarget ?? 40),
      testDrivesTarget: Number(dashboardGoals.sellerTestDrivesTarget ?? 8),
      wonLeadsTarget: Number(dashboardGoals.sellerWonLeadsTarget ?? 4),
      contactedRateTarget: Number(dashboardGoals.sellerContactRateTarget ?? 90),
    };
  }

  private resolvePeriodDays(periodDaysRaw?: string) {
    const parsed = Number(periodDaysRaw);
    return [7, 30, 90].includes(parsed) ? parsed : 30;
  }

  private resolveChartDays(periodDays: number) {
    if (periodDays === 90) return 21;
    if (periodDays === 30) return 14;
    return 7;
  }

  private formatNumber(value: number) {
    return Number(value ?? 0).toLocaleString('pt-BR');
  }

  private formatMonthYear(date: Date) {
    return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  }

  private resolveMemoryUsagePercent() {
    const memory = process.memoryUsage();
    return memory.heapTotal > 0 ? Math.round((memory.heapUsed / memory.heapTotal) * 100) : 0;
  }

  private startOfDay(date: Date) {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    return result;
  }

  private startOfMonth(date: Date) {
    const result = new Date(date);
    result.setDate(1);
    result.setHours(0, 0, 0, 0);
    return result;
  }

  private daysAgo(days: number) {
    const result = new Date();
    result.setHours(0, 0, 0, 0);
    result.setDate(result.getDate() - days);
    return result;
  }

  private hoursAgo(hours: number) {
    return new Date(Date.now() - hours * 60 * 60 * 1000);
  }

  private isSystemAdmin(user: JwtUser) {
    return user.roles.includes('Admin');
  }

  private isShopAdmin(user: JwtUser) {
    return !!user.shopId && user.roles.some((role) => ['ShopOwner', 'Admin'].includes(role));
  }

  private ensureSystemAdmin(user: JwtUser) {
    if (!this.isSystemAdmin(user)) {
      throw new ForbiddenException('Acesso restrito ao admin do sistema.');
    }
  }

  private ensureShopAdmin(user: JwtUser) {
    if (!this.isShopAdmin(user)) {
      throw new ForbiddenException('Acesso restrito ao admin da loja.');
    }
  }

  private ensureSellerScope(user: JwtUser) {
    if (!user.shopId) {
      throw new ForbiddenException('Dashboard do vendedor exige loja vinculada.');
    }
  }
}
