import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShopEntity } from '../shops/entities/shop.entity';
import { SubscriptionPaymentEntity } from '../subscriptions/entities/subscription-payment.entity';
import { SubscriptionEntity } from '../subscriptions/entities/subscription.entity';
import {
  NotificationFrequency,
  NotificationPreferenceDto,
} from './dto/update-notification-preferences.dto';
import {
  LeadRoutingMode,
  ShopPreferencesDto,
} from './dto/update-shop-preferences.dto';

type PaymentStatus = 'healthy' | 'attention' | 'inactive';

type NotificationPreferenceView = NotificationPreferenceDto & {
  title: string;
  description: string;
};

const DEFAULT_SHOP_PREFERENCES: ShopPreferencesDto = {
  leadRoutingMode: LeadRoutingMode.Manual,
  showVehiclePrice: true,
  allowPublicTestDriveScheduling: true,
  enablePublicCatalog: true,
  receiveLeadsOutsideBusinessHours: false,
};

const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferenceView[] = [
  {
    key: 'leads',
    title: 'Novos leads',
    description: 'Avisos para leads recebidos e mudanças de estágio comercial.',
    email: true,
    whatsapp: true,
    sms: false,
    push: true,
    frequency: NotificationFrequency.Immediate,
  },
  {
    key: 'test_drives',
    title: 'Test drives',
    description: 'Confirmações, lembretes e alterações em agendamentos de test drive.',
    email: true,
    whatsapp: true,
    sms: false,
    push: true,
    frequency: NotificationFrequency.Immediate,
  },
  {
    key: 'billing',
    title: 'Cobrança e assinatura',
    description: 'Cobrança recorrente, vencimentos e alertas de risco financeiro.',
    email: true,
    whatsapp: false,
    sms: false,
    push: true,
    frequency: NotificationFrequency.Daily,
  },
  {
    key: 'inventory',
    title: 'Estoque e sincronização',
    description: 'Falhas, sucesso de sincronização e sinais de divergência operacional.',
    email: true,
    whatsapp: false,
    sms: false,
    push: true,
    frequency: NotificationFrequency.Daily,
  },
  {
    key: 'platform',
    title: 'Novidades da plataforma',
    description: 'Melhorias, comunicados e avisos institucionais do produto.',
    email: false,
    whatsapp: false,
    sms: false,
    push: true,
    frequency: NotificationFrequency.Weekly,
  },
];

@Injectable()
export class SettingsService {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(ShopEntity)
    private readonly shopsRepository: Repository<ShopEntity>,
    @InjectRepository(SubscriptionEntity)
    private readonly subscriptionsRepository: Repository<SubscriptionEntity>,
    @InjectRepository(SubscriptionPaymentEntity)
    private readonly paymentsRepository: Repository<SubscriptionPaymentEntity>,
  ) {}

  async getOverview(shopId?: string) {
    const [shop, activePlan, paymentAggregate] = await Promise.all([
      shopId ? this.loadShop(shopId) : Promise.resolve(null),
      this.loadActivePlan(shopId),
      this.loadPaymentAggregate(shopId),
    ]);

    const provider = this.buildProviderStatus();
    const access = this.buildAccessStatus({
      shop,
      billingStatus: paymentAggregate.health.status,
    });
    const recommendations = this.buildRecommendations({
      shop,
      providerConfigured: provider.configured,
      billingStatus: paymentAggregate.health.status,
      accessLocked: access.locked,
    });

    return {
      generatedAt: new Date().toISOString(),
      scope: shop ? 'shop' : 'platform',
      provider,
      access,
      shop: shop
        ? {
            id: shop.id,
            name: shop.name,
            city: shop.city,
            state: shop.state,
            email: shop.email,
            ownerName: shop.owner?.userName ?? null,
            ownerEmail: shop.owner?.email ?? null,
            usersCount: shop.users?.length ?? 0,
            inventorySyncEnabled: shop.inventorySyncEnabled,
            inventoryLastSyncAt: shop.inventoryLastSyncAt,
            inventoryLastSyncStatus: shop.inventoryLastSyncStatus,
            inventoryLastSyncError: shop.inventoryLastSyncError,
          }
        : null,
      billing: {
        activePlan,
        currentPayment: paymentAggregate.currentPayment,
        health: paymentAggregate.health,
        metrics: paymentAggregate.metrics,
      },
      recommendations,
    };
  }

  async getShopPreferences(shopId: string) {
    const shop = await this.loadShop(shopId);
    const preferences = this.normalizeShopPreferences(shop.settingsPreferences);

    return {
      shopId: shop.id,
      updatedAt: shop.updatedAt,
      preferences,
    };
  }

  async updateShopPreferences(shopId: string, payload: ShopPreferencesDto) {
    const shop = await this.loadShop(shopId);
    const preferences = this.normalizeShopPreferences(payload);

    shop.settingsPreferences = preferences as unknown as Record<string, unknown>;

    const updatedShop = await this.shopsRepository.save(shop);

    return {
      shopId: updatedShop.id,
      updatedAt: updatedShop.updatedAt,
      preferences,
    };
  }

  async getNotificationPreferences(shopId: string) {
    const shop = await this.loadShop(shopId);
    const preferences = this.normalizeNotificationPreferences(shop.notificationPreferences);

    return {
      shopId: shop.id,
      updatedAt: shop.updatedAt,
      preferences,
    };
  }

  async updateNotificationPreferences(
    shopId: string,
    payload: NotificationPreferenceDto[],
  ) {
    const shop = await this.loadShop(shopId);
    const preferences = this.normalizeNotificationPreferences(payload);

    shop.notificationPreferences = preferences.map(({ key, email, whatsapp, sms, push, frequency }) => ({
      key,
      email,
      whatsapp,
      sms,
      push,
      frequency,
    }));

    const updatedShop = await this.shopsRepository.save(shop);

    return {
      shopId: updatedShop.id,
      updatedAt: updatedShop.updatedAt,
      preferences,
    };
  }

  private async loadShop(shopId: string) {
    const shop = await this.shopsRepository.findOne({
      where: { id: shopId },
      relations: {
        owner: true,
        users: true,
      },
    });

    if (!shop) {
      throw new NotFoundException('Loja nao encontrada.');
    }

    return shop;
  }

  private async loadActivePlan(shopId?: string) {
    const currentPayment = shopId
      ? await this.paymentsRepository.findOne({
          where: { shopId },
          relations: {
            subscription: true,
          },
          order: {
            createdAt: 'DESC',
          },
        })
      : await this.paymentsRepository.findOne({
          relations: {
            subscription: true,
          },
          order: {
            createdAt: 'DESC',
          },
        });

    const subscription =
      currentPayment?.subscription ??
      (await this.subscriptionsRepository.findOne({
        where: { isActive: true },
        order: { price: 'ASC' },
      }));

    if (!subscription) {
      return null;
    }

    return {
      id: subscription.id,
      name: subscription.name,
      description: subscription.description,
      price: Number(subscription.price),
      durationInDays: Number(subscription.durationInDays),
      qrCodeLimit: Number(subscription.qrCodeLimit),
      type: subscription.type,
      isActive: subscription.isActive,
    };
  }

  private async loadPaymentAggregate(shopId?: string) {
    const payments = await this.paymentsRepository.find(
      shopId
        ? {
            where: { shopId },
            relations: {
              subscription: true,
              shop: true,
              user: true,
            },
            order: {
              createdAt: 'DESC',
            },
            take: 50,
          }
        : {
            relations: {
              subscription: true,
              shop: true,
              user: true,
            },
            order: {
              createdAt: 'DESC',
            },
            take: 50,
          },
    );

    const currentPayment = payments[0] ?? null;
    const now = new Date();
    const currentCoverage = currentPayment
      ? this.isPaymentCoveringToday(currentPayment, now)
      : false;

    const healthStatus: PaymentStatus = !currentPayment
      ? 'inactive'
      : currentCoverage
        ? 'healthy'
        : 'attention';

    const totalBilled = payments.reduce((sum, item) => sum + Number(item.amount), 0);
    const overdueCount = payments.filter(
      (item) => (item.status ?? '').toLowerCase() === 'overdue',
    ).length;
    const paidCount = payments.filter((item) =>
      ['paid', 'active', 'authorized', 'succeeded'].includes(
        (item.status ?? '').toLowerCase(),
      ),
    ).length;

    return {
      currentPayment: currentPayment
        ? {
            id: currentPayment.id,
            subscriptionId: currentPayment.subscriptionId,
            subscriptionName: currentPayment.subscription?.name ?? null,
            amount: Number(currentPayment.amount),
            status: currentPayment.status,
            invoiceUrl: currentPayment.invoiceUrl,
            startDate: currentPayment.startDate,
            endDate: currentPayment.endDate,
            createdAt: currentPayment.createdAt,
            isCurrentCoverageValid: currentCoverage,
          }
        : null,
      health: {
        status: healthStatus,
        title:
          healthStatus === 'healthy'
            ? 'Cobranca protegida'
            : healthStatus === 'attention'
              ? 'Cobranca exige atencao'
              : 'Nenhuma cobranca ativa',
        detail: currentPayment
          ? currentCoverage
            ? 'Existe uma assinatura com cobertura valida para o periodo atual.'
            : 'O ultimo pagamento nao cobre a data atual ou esta com status de risco.'
          : 'Nenhum pagamento foi registrado ainda para este escopo.',
      },
      metrics: {
        totalPayments: payments.length,
        paidPayments: paidCount,
        overduePayments: overdueCount,
        totalBilled,
      },
    };
  }

  private isPaymentCoveringToday(payment: SubscriptionPaymentEntity, now: Date) {
    const status = (payment.status ?? '').toLowerCase();
    const statusOk = ['paid', 'active', 'authorized', 'succeeded'].includes(status);

    if (!statusOk) {
      return false;
    }

    if (!payment.startDate || !payment.endDate) {
      return false;
    }

    return payment.startDate.getTime() <= now.getTime() && payment.endDate.getTime() >= now.getTime();
  }

  private buildProviderStatus() {
    const apiKey = this.readFirstDefined(['ASAAS_API_KEY', 'ASAAS_ACCESS_TOKEN']);
    const environment = this.readFirstDefined(['ASAAS_ENV', 'ASAAS_ENVIRONMENT']) ?? 'sandbox';
    const baseUrl =
      this.readFirstDefined(['ASAAS_BASE_URL']) ??
      (environment === 'production'
        ? 'https://api.asaas.com/v3'
        : 'https://sandbox.asaas.com/api/v3');
    const webhookUrl = this.readFirstDefined(['ASAAS_WEBHOOK_URL']);
    const walletId = this.readFirstDefined(['ASAAS_WALLET_ID']);
    const webhookToken = this.readFirstDefined(['ASAAS_WEBHOOK_TOKEN']);

    const checks = {
      apiKeyConfigured: Boolean(apiKey),
      baseUrlConfigured: Boolean(baseUrl),
      webhookConfigured: Boolean(webhookUrl),
      walletConfigured: Boolean(walletId),
      webhookTokenConfigured: Boolean(webhookToken),
    };

    return {
      name: 'Asaas',
      key: 'asaas',
      environment,
      baseUrl,
      configured: Object.values(checks).every(Boolean),
      checks,
    };
  }

  private buildRecommendations(input: {
    shop: ShopEntity | null;
    providerConfigured: boolean;
    billingStatus: PaymentStatus;
    accessLocked: boolean;
  }) {
    const recommendations: string[] = [];

    if (input.accessLocked) {
      recommendations.push(
        'A loja ultrapassou o periodo free de 15 dias sem assinatura ativa. Regularize o plano para liberar o restante da operacao.',
      );
    }

    if (!input.providerConfigured) {
      recommendations.push(
        'Completar as variaveis do Asaas para habilitar cobranca automatica, webhooks e rastreabilidade.',
      );
    }

    if (input.billingStatus !== 'healthy') {
      recommendations.push(
        'Priorizar a regularizacao da assinatura atual para evitar bloqueio operacional e desgaste comercial.',
      );
    }

    if (input.shop && !input.shop.inventorySyncEnabled) {
      recommendations.push(
        'Ativar a sincronizacao de estoque para reduzir divergencia entre operacao comercial e configuracao da loja.',
      );
    }

    if (!recommendations.length) {
      recommendations.push(
        'A configuracao principal esta madura. O proximo passo natural e automatizar eventos de cobranca e conciliacao.',
      );
    }

    return recommendations;
  }

  private buildAccessStatus(input: {
    shop: ShopEntity | null;
    billingStatus: PaymentStatus;
  }) {
    if (!input.shop) {
      return {
        mode: 'platform',
        locked: false,
        reason: null,
        trialStartedAt: null,
        trialEndsAt: null,
        trialDaysRemaining: null,
      };
    }

    const createdAt = input.shop.createdAt ?? new Date();
    const trialEndsAt = new Date(createdAt);
    trialEndsAt.setDate(trialEndsAt.getDate() + 15);

    const now = new Date();
    const hasActiveBilling = input.billingStatus === 'healthy';
    const trialActive = now.getTime() <= trialEndsAt.getTime();
    const locked = !hasActiveBilling && !trialActive;
    const daysRemaining = Math.max(
      0,
      Math.ceil((trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
    );

    return {
      mode: hasActiveBilling ? 'paid' : trialActive ? 'trial' : 'blocked',
      locked,
      reason: locked ? 'trial_expired_without_active_plan' : null,
      trialStartedAt: createdAt,
      trialEndsAt,
      trialDaysRemaining: hasActiveBilling ? 0 : daysRemaining,
    };
  }

  private readFirstDefined(keys: string[]) {
    for (const key of keys) {
      const value = this.configService.get<string>(key);
      if (value && value.trim()) {
        return value.trim();
      }
    }

    return null;
  }

  private normalizeShopPreferences(raw: unknown): ShopPreferencesDto {
    const source = this.isObjectRecord(raw) ? raw : {};

    return {
      leadRoutingMode: this.isLeadRoutingMode(source.leadRoutingMode)
        ? source.leadRoutingMode
        : DEFAULT_SHOP_PREFERENCES.leadRoutingMode,
      showVehiclePrice:
        typeof source.showVehiclePrice === 'boolean'
          ? source.showVehiclePrice
          : DEFAULT_SHOP_PREFERENCES.showVehiclePrice,
      allowPublicTestDriveScheduling:
        typeof source.allowPublicTestDriveScheduling === 'boolean'
          ? source.allowPublicTestDriveScheduling
          : DEFAULT_SHOP_PREFERENCES.allowPublicTestDriveScheduling,
      enablePublicCatalog:
        typeof source.enablePublicCatalog === 'boolean'
          ? source.enablePublicCatalog
          : DEFAULT_SHOP_PREFERENCES.enablePublicCatalog,
      receiveLeadsOutsideBusinessHours:
        typeof source.receiveLeadsOutsideBusinessHours === 'boolean'
          ? source.receiveLeadsOutsideBusinessHours
          : DEFAULT_SHOP_PREFERENCES.receiveLeadsOutsideBusinessHours,
    };
  }

  private normalizeNotificationPreferences(raw: unknown): NotificationPreferenceView[] {
    const persisted = Array.isArray(raw) ? raw : [];

    return DEFAULT_NOTIFICATION_PREFERENCES.map((item) => {
      const found = persisted.find(
        (entry): entry is Record<string, unknown> =>
          this.isObjectRecord(entry) && entry.key === item.key,
      );

      return {
        ...item,
        email: typeof found?.email === 'boolean' ? found.email : item.email,
        whatsapp: typeof found?.whatsapp === 'boolean' ? found.whatsapp : item.whatsapp,
        sms: typeof found?.sms === 'boolean' ? found.sms : item.sms,
        push: typeof found?.push === 'boolean' ? found.push : item.push,
        frequency: this.isNotificationFrequency(found?.frequency)
          ? found.frequency
          : item.frequency,
      };
    });
  }

  private isObjectRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  private isLeadRoutingMode(value: unknown): value is LeadRoutingMode {
    return Object.values(LeadRoutingMode).includes(value as LeadRoutingMode);
  }

  private isNotificationFrequency(value: unknown): value is NotificationFrequency {
    return Object.values(NotificationFrequency).includes(value as NotificationFrequency);
  }
}
