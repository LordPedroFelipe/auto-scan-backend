import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShopEntity } from '../shops/entities/shop.entity';
import { SubscriptionPaymentEntity } from '../subscriptions/entities/subscription-payment.entity';
import { SubscriptionEntity } from '../subscriptions/entities/subscription.entity';

type PaymentStatus = 'healthy' | 'attention' | 'inactive';

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
    const recommendations = this.buildRecommendations({
      shop,
      providerConfigured: provider.configured,
      billingStatus: paymentAggregate.health.status,
    });

    return {
      generatedAt: new Date().toISOString(),
      scope: shop ? 'shop' : 'platform',
      provider,
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

    const checks = {
      apiKeyConfigured: Boolean(apiKey),
      baseUrlConfigured: Boolean(baseUrl),
      webhookConfigured: Boolean(webhookUrl),
      walletConfigured: Boolean(walletId),
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
  }) {
    const recommendations: string[] = [];

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

  private readFirstDefined(keys: string[]) {
    for (const key of keys) {
      const value = this.configService.get<string>(key);
      if (value && value.trim()) {
        return value.trim();
      }
    }

    return null;
  }
}
