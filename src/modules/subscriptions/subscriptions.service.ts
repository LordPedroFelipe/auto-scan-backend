import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShopEntity } from '../shops/entities/shop.entity';
import { UserEntity } from '../users/entities/user.entity';
import { AsaasBillingService } from './asaas-billing.service';
import { AsaasWebhookDto } from './dto/asaas-webhook.dto';
import {
  BillingCycle,
  CreateBillingCheckoutDto,
} from './dto/create-billing-checkout.dto';
import { CreateSubscriptionPaymentDto } from './dto/create-subscription-payment.dto';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { SubscriptionPaymentsQueryDto } from './dto/subscription-payments-query.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { SubscriptionPaymentEntity } from './entities/subscription-payment.entity';
import { SubscriptionEntity } from './entities/subscription.entity';

@Injectable()
export class SubscriptionsService {
  constructor(
    private readonly configService: ConfigService,
    private readonly asaasBillingService: AsaasBillingService,
    @InjectRepository(SubscriptionEntity)
    private readonly subscriptionsRepository: Repository<SubscriptionEntity>,
    @InjectRepository(SubscriptionPaymentEntity)
    private readonly paymentsRepository: Repository<SubscriptionPaymentEntity>,
    @InjectRepository(ShopEntity)
    private readonly shopsRepository: Repository<ShopEntity>,
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
  ) {}

  async listSubscriptions(query: SubscriptionPaymentsQueryDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 10;

    const qb = this.subscriptionsRepository.createQueryBuilder('subscription');

    if (query.status) {
      qb.andWhere('subscription.isActive = :isActive', {
        isActive: query.status.toLowerCase() === 'active',
      });
    }

    qb.orderBy('subscription.createdAt', 'DESC');
    qb.skip((page - 1) * pageSize);
    qb.take(pageSize);

    const [items, totalCount] = await qb.getManyAndCount();
    return this.paginate(
      items.map((item) => this.toSubscriptionResponse(item)),
      totalCount,
      page,
      pageSize,
    );
  }

  async getSubscription(id: string) {
    const subscription = await this.getSubscriptionEntity(id);
    return this.toSubscriptionResponse(subscription);
  }

  async createSubscription(dto: CreateSubscriptionDto) {
    const subscription = this.subscriptionsRepository.create({
      ...dto,
      description: dto.description ?? null,
      isActive: dto.isActive ?? true,
    });
    const saved = await this.subscriptionsRepository.save(subscription);
    return this.toSubscriptionResponse(saved);
  }

  async updateSubscription(id: string, dto: UpdateSubscriptionDto) {
    const subscription = await this.getSubscriptionEntity(id);
    Object.assign(subscription, dto);
    const saved = await this.subscriptionsRepository.save(subscription);
    return this.toSubscriptionResponse(saved);
  }

  async removeSubscription(id: string) {
    const subscription = await this.getSubscriptionEntity(id);
    await this.subscriptionsRepository.remove(subscription);
    return { success: true };
  }

  async listPayments(query: SubscriptionPaymentsQueryDto, shopId?: string) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 10;

    const qb = this.paymentsRepository
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.subscription', 'subscription')
      .leftJoinAndSelect('payment.shop', 'shop')
      .leftJoinAndSelect('payment.user', 'user');

    if (shopId) {
      qb.andWhere('payment.shopId = :shopId', { shopId });
    }

    if (query.status) {
      qb.andWhere('LOWER(payment.status) = LOWER(:status)', { status: query.status });
    }

    qb.orderBy('payment.createdAt', 'DESC');
    qb.skip((page - 1) * pageSize);
    qb.take(pageSize);

    const [items, totalCount] = await qb.getManyAndCount();
    return this.paginate(
      items.map((item) => this.toPaymentResponse(item)),
      totalCount,
      page,
      pageSize,
    );
  }

  async createPayment(shopId: string, subscriptionId: string, dto: CreateSubscriptionPaymentDto) {
    const subscription = await this.getSubscriptionEntity(subscriptionId);
    const shop = await this.getShopEntity(shopId);
    const user = await this.getOptionalUser(dto.userId);

    const payment = this.paymentsRepository.create({
      subscriptionId: subscription.id,
      shopId: shop.id,
      userId: user?.id ?? null,
      amount: dto.amount,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      dueDate: new Date(dto.endDate),
      status: dto.status,
      invoiceUrl: dto.invoiceUrl ?? null,
      billingProvider: null,
      paymentMethod: null,
      providerPaymentId: null,
      providerCustomerId: null,
      externalReference: null,
      pixQrCode: null,
      pixCopyPaste: null,
      paidAt: this.isPaidStatus(dto.status) ? new Date() : null,
      providerPayload: null,
    });

    const saved = await this.paymentsRepository.save(payment);
    const loaded = await this.paymentsRepository.findOne({
      where: { id: saved.id },
      relations: { subscription: true, shop: true, user: true },
    });

    if (!loaded) {
      throw new NotFoundException('Pagamento nao encontrado apos criacao.');
    }

    return this.toPaymentResponse(loaded);
  }

  async createCheckout(
    shopId: string,
    subscriptionId: string,
    dto: CreateBillingCheckoutDto,
  ) {
    const subscription = await this.getSubscriptionEntity(subscriptionId);
    const shop = await this.getShopEntity(shopId);

    if (!this.asaasBillingService.isConfigured()) {
      throw new InternalServerErrorException(
        'Asaas nao configurado. Revise as variaveis de ambiente antes de gerar cobranca.',
      );
    }

    const customer = await this.asaasBillingService.ensureCustomer(shop);
    if (
      shop.billingCustomerProvider !== customer.provider ||
      shop.billingCustomerExternalId !== customer.customerId
    ) {
      shop.billingCustomerProvider = customer.provider;
      shop.billingCustomerExternalId = customer.customerId;
      shop.billingCustomerSyncedAt = new Date();
      await this.shopsRepository.save(shop);
    }

    const billingTerms = this.resolveBillingTerms(subscription, dto.billingCycle);
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + billingTerms.durationInDays);

    const localPayment = await this.paymentsRepository.save(
      this.paymentsRepository.create({
        subscriptionId: subscription.id,
        shopId: shop.id,
        userId: null,
        amount: billingTerms.amount,
        startDate,
        endDate,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : startDate,
        status: 'pending',
        billingProvider: 'asaas',
        paymentMethod: dto.paymentMethod,
        externalReference: `subscription-payment:${shop.id}:${subscription.id}:${Date.now()}`,
        invoiceUrl: null,
        providerPaymentId: null,
        providerCustomerId: customer.customerId,
        pixQrCode: null,
        pixCopyPaste: null,
        paidAt: null,
        providerPayload: null,
      }),
    );

    const providerPayment = await this.asaasBillingService.createSubscriptionCharge({
      customerId: customer.customerId,
      amount: billingTerms.amount,
      billingType: dto.paymentMethod,
      dueDate: dto.dueDate ?? this.toDateOnly(startDate),
      description:
        dto.description ??
        `Assinatura ${subscription.name} ${billingTerms.label} - ${shop.name}`,
      externalReference:
        localPayment.externalReference ?? `subscription-payment:${localPayment.id}`,
    });

    const updated = await this.applyProviderPaymentToLocal(localPayment, providerPayment);

    return {
      payment: updated,
      checkout: {
        provider: 'asaas',
        invoiceUrl: updated.invoiceUrl,
        pixQrCode: updated.pixQrCode,
        pixCopyPaste: updated.pixCopyPaste,
        dueDate: updated.dueDate,
        billingCycle: billingTerms.billingCycle,
        amount: billingTerms.amount,
        installmentAmount: billingTerms.installmentAmount,
        durationInDays: billingTerms.durationInDays,
      },
    };
  }

  async syncPaymentStatus(id: string) {
    const payment = await this.paymentsRepository.findOne({ where: { id } });
    if (!payment) {
      throw new NotFoundException('Pagamento nao encontrado.');
    }

    if (payment.billingProvider !== 'asaas' || !payment.providerPaymentId) {
      throw new BadRequestException(
        'Pagamento nao possui vinculo com provedor para sincronizacao.',
      );
    }

    const providerPayment = await this.asaasBillingService.getPayment(payment.providerPaymentId);
    return this.applyProviderPaymentToLocal(payment, providerPayment);
  }

  async processAsaasWebhook(payload: AsaasWebhookDto, token?: string) {
    const expectedToken = this.configService.get<string>('ASAAS_WEBHOOK_TOKEN');
    if (expectedToken && expectedToken !== token) {
      throw new UnauthorizedException('Webhook do Asaas nao autorizado.');
    }

    const paymentData =
      payload.payment && typeof payload.payment === 'object' ? payload.payment : null;
    const providerPaymentId =
      paymentData && typeof paymentData.id === 'string' ? paymentData.id : null;
    const externalReference =
      paymentData && typeof paymentData.externalReference === 'string'
        ? paymentData.externalReference
        : null;

    if (!providerPaymentId && !externalReference) {
      throw new BadRequestException('Webhook do Asaas sem identificador de pagamento.');
    }

    let payment: SubscriptionPaymentEntity | null = null;

    if (providerPaymentId) {
      payment = await this.paymentsRepository.findOne({ where: { providerPaymentId } });
    }

    if (!payment && externalReference) {
      payment = await this.paymentsRepository.findOne({ where: { externalReference } });
    }

    if (!payment) {
      return {
        processed: false,
        reason: 'payment_not_found',
      };
    }

    const updated = await this.applyProviderPaymentToLocal(payment, paymentData ?? {});

    return {
      processed: true,
      event: payload.event ?? null,
      payment: updated,
    };
  }

  private paginate<T>(items: T[], totalCount: number, page: number, pageSize: number) {
    const totalPages = Math.ceil(totalCount / pageSize) || 1;
    return {
      items,
      pageNumber: page,
      pageSize,
      totalPages,
      totalCount,
      hasPreviousPage: page > 1,
      hasNextPage: page < totalPages,
    };
  }

  private toPaymentResponse(payment: SubscriptionPaymentEntity) {
    return {
      id: payment.id,
      subscriptionId: payment.subscriptionId,
      subscriptionName: payment.subscription?.name ?? '',
      shopId: payment.shopId,
      shopName: payment.shop?.name ?? null,
      userId: payment.userId,
      userName: payment.user?.userName ?? null,
      amount: Number(payment.amount),
      startDate: payment.startDate,
      endDate: payment.endDate,
      dueDate: payment.dueDate,
      paidAt: payment.paidAt,
      status: payment.status,
      invoiceUrl: payment.invoiceUrl,
      billingProvider: payment.billingProvider,
      paymentMethod: payment.paymentMethod,
      providerPaymentId: payment.providerPaymentId,
      providerCustomerId: payment.providerCustomerId,
      externalReference: payment.externalReference,
      pixQrCode: payment.pixQrCode,
      pixCopyPaste: payment.pixCopyPaste,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
    };
  }

  private toSubscriptionResponse(subscription: SubscriptionEntity) {
    return {
      ...subscription,
      price: Number(subscription.price),
      durationInDays: Number(subscription.durationInDays),
      qrCodeLimit: Number(subscription.qrCodeLimit),
    };
  }

  private async getSubscriptionEntity(id: string) {
    const subscription = await this.subscriptionsRepository.findOne({ where: { id } });
    if (!subscription) {
      throw new NotFoundException('Plano nao encontrado.');
    }

    return subscription;
  }

  private async getShopEntity(shopId: string) {
    const shop = await this.shopsRepository.findOne({ where: { id: shopId } });
    if (!shop) {
      throw new BadRequestException('Loja nao encontrada.');
    }

    return shop;
  }

  private async getOptionalUser(userId?: string | null) {
    if (!userId) {
      return null;
    }

    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('Usuario nao encontrado.');
    }

    return user;
  }

  private isPaidStatus(status: string) {
    return ['paid', 'active', 'succeeded', 'authorized', 'received'].includes(
      status.toLowerCase(),
    );
  }

  private normalizeProviderStatus(status?: string | null) {
    const normalized = (status ?? 'pending').toLowerCase();

    const providerMap: Record<string, string> = {
      pending: 'pending',
      confirmed: 'paid',
      received: 'paid',
      received_in_cash: 'paid',
      overdue: 'overdue',
      refunded: 'refunded',
      refund_requested: 'attention',
      chargeback_requested: 'attention',
      chargeback_dispute: 'attention',
      awaiting_risk_analysis: 'pending',
      authorized: 'authorized',
      active: 'active',
      canceled: 'canceled',
    };

    return providerMap[normalized] ?? normalized;
  }

  private resolveBillingTerms(
    subscription: SubscriptionEntity,
    requestedCycle?: BillingCycle,
  ) {
    const baseCycle: BillingCycle =
      subscription.type === 'Yearly' ? BillingCycle.Yearly : BillingCycle.Monthly;
    const billingCycle = requestedCycle ?? baseCycle;
    const rawPrice = Number(subscription.price);
    const baseDuration = Number(
      subscription.durationInDays || (baseCycle === BillingCycle.Yearly ? 365 : 30),
    );

    if (billingCycle === baseCycle) {
      return {
        billingCycle,
        amount: rawPrice,
        durationInDays: baseDuration,
        installmentAmount:
          billingCycle === BillingCycle.Yearly
            ? Number((rawPrice / 12).toFixed(2))
            : rawPrice,
        label: billingCycle === BillingCycle.Yearly ? 'anual' : 'mensal',
      };
    }

    if (billingCycle === BillingCycle.Yearly) {
      return {
        billingCycle,
        amount: Number((rawPrice * 12).toFixed(2)),
        durationInDays: Math.max(baseDuration * 12, 365),
        installmentAmount: rawPrice,
        label: 'anual',
      };
    }

    return {
      billingCycle,
      amount: Number((rawPrice / 12).toFixed(2)),
      durationInDays: Math.max(Math.round(baseDuration / 12), 30),
      installmentAmount: Number((rawPrice / 12).toFixed(2)),
      label: 'mensal',
    };
  }

  private async applyProviderPaymentToLocal(
    payment: SubscriptionPaymentEntity,
    providerPaymentRaw: Record<string, unknown>,
  ) {
    payment.billingProvider = 'asaas';
    payment.status = this.normalizeProviderStatus(
      typeof providerPaymentRaw.status === 'string'
        ? providerPaymentRaw.status
        : payment.status,
    );
    payment.invoiceUrl =
      (typeof providerPaymentRaw.invoiceUrl === 'string' && providerPaymentRaw.invoiceUrl) ||
      (typeof providerPaymentRaw.bankSlipUrl === 'string' && providerPaymentRaw.bankSlipUrl) ||
      payment.invoiceUrl;
    payment.paymentMethod =
      (typeof providerPaymentRaw.billingType === 'string' && providerPaymentRaw.billingType) ||
      payment.paymentMethod;
    payment.providerPaymentId =
      (typeof providerPaymentRaw.id === 'string' && providerPaymentRaw.id) ||
      payment.providerPaymentId;
    payment.providerCustomerId =
      (typeof providerPaymentRaw.customer === 'string' && providerPaymentRaw.customer) ||
      payment.providerCustomerId;
    payment.externalReference =
      (typeof providerPaymentRaw.externalReference === 'string' &&
        providerPaymentRaw.externalReference) ||
      payment.externalReference;
    payment.dueDate =
      typeof providerPaymentRaw.dueDate === 'string'
        ? new Date(providerPaymentRaw.dueDate)
        : payment.dueDate;
    payment.paidAt =
      typeof providerPaymentRaw.paymentDate === 'string'
        ? new Date(providerPaymentRaw.paymentDate)
        : this.isPaidStatus(payment.status)
          ? payment.paidAt ?? new Date()
          : null;

    const pixTransaction =
      providerPaymentRaw.pixTransaction &&
      typeof providerPaymentRaw.pixTransaction === 'object' &&
      !Array.isArray(providerPaymentRaw.pixTransaction)
        ? (providerPaymentRaw.pixTransaction as Record<string, unknown>)
        : null;

    payment.pixQrCode =
      (typeof pixTransaction?.encodedImage === 'string' && pixTransaction.encodedImage) ||
      payment.pixQrCode;
    payment.pixCopyPaste =
      (typeof pixTransaction?.payload === 'string' && pixTransaction.payload) ||
      payment.pixCopyPaste;
    payment.providerPayload = providerPaymentRaw;

    const saved = await this.paymentsRepository.save(payment);
    const loaded = await this.paymentsRepository.findOne({
      where: { id: saved.id },
      relations: { subscription: true, shop: true, user: true },
    });

    if (!loaded) {
      throw new NotFoundException('Pagamento atualizado nao encontrado.');
    }

    return this.toPaymentResponse(loaded);
  }

  private toDateOnly(date: Date) {
    return date.toISOString().slice(0, 10);
  }
}
