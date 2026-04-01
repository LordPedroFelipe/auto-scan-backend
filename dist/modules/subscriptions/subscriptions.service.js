"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const shop_entity_1 = require("../shops/entities/shop.entity");
const user_entity_1 = require("../users/entities/user.entity");
const asaas_billing_service_1 = require("./asaas-billing.service");
const create_billing_checkout_dto_1 = require("./dto/create-billing-checkout.dto");
const subscription_payment_entity_1 = require("./entities/subscription-payment.entity");
const subscription_entity_1 = require("./entities/subscription.entity");
let SubscriptionsService = class SubscriptionsService {
    constructor(configService, asaasBillingService, subscriptionsRepository, paymentsRepository, shopsRepository, usersRepository) {
        this.configService = configService;
        this.asaasBillingService = asaasBillingService;
        this.subscriptionsRepository = subscriptionsRepository;
        this.paymentsRepository = paymentsRepository;
        this.shopsRepository = shopsRepository;
        this.usersRepository = usersRepository;
    }
    async listSubscriptions(query) {
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
        return this.paginate(items.map((item) => this.toSubscriptionResponse(item)), totalCount, page, pageSize);
    }
    async getSubscription(id) {
        const subscription = await this.getSubscriptionEntity(id);
        return this.toSubscriptionResponse(subscription);
    }
    async createSubscription(dto) {
        const subscription = this.subscriptionsRepository.create({
            ...dto,
            description: dto.description ?? null,
            isActive: dto.isActive ?? true,
        });
        const saved = await this.subscriptionsRepository.save(subscription);
        return this.toSubscriptionResponse(saved);
    }
    async updateSubscription(id, dto) {
        const subscription = await this.getSubscriptionEntity(id);
        Object.assign(subscription, dto);
        const saved = await this.subscriptionsRepository.save(subscription);
        return this.toSubscriptionResponse(saved);
    }
    async removeSubscription(id) {
        const subscription = await this.getSubscriptionEntity(id);
        await this.subscriptionsRepository.remove(subscription);
        return { success: true };
    }
    async listPayments(query, shopId) {
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
        return this.paginate(items.map((item) => this.toPaymentResponse(item)), totalCount, page, pageSize);
    }
    async createPayment(shopId, subscriptionId, dto) {
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
            throw new common_1.NotFoundException('Pagamento nao encontrado apos criacao.');
        }
        return this.toPaymentResponse(loaded);
    }
    async createCheckout(shopId, subscriptionId, dto) {
        const subscription = await this.getSubscriptionEntity(subscriptionId);
        const shop = await this.getShopEntity(shopId);
        if (!this.asaasBillingService.isConfigured()) {
            throw new common_1.InternalServerErrorException('Asaas nao configurado. Revise as variaveis de ambiente antes de gerar cobranca.');
        }
        const customer = await this.asaasBillingService.ensureCustomer(shop);
        if (shop.billingCustomerProvider !== customer.provider ||
            shop.billingCustomerExternalId !== customer.customerId) {
            shop.billingCustomerProvider = customer.provider;
            shop.billingCustomerExternalId = customer.customerId;
            shop.billingCustomerSyncedAt = new Date();
            await this.shopsRepository.save(shop);
        }
        const billingTerms = this.resolveBillingTerms(subscription, dto.billingCycle);
        const startDate = new Date();
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + billingTerms.durationInDays);
        const localPayment = await this.paymentsRepository.save(this.paymentsRepository.create({
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
        }));
        const providerPayment = await this.asaasBillingService.createSubscriptionCharge({
            customerId: customer.customerId,
            amount: billingTerms.amount,
            billingType: dto.paymentMethod,
            dueDate: dto.dueDate ?? this.toDateOnly(startDate),
            description: dto.description ??
                `Assinatura ${subscription.name} ${billingTerms.label} - ${shop.name}`,
            externalReference: localPayment.externalReference ?? `subscription-payment:${localPayment.id}`,
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
    async syncPaymentStatus(id) {
        const payment = await this.paymentsRepository.findOne({ where: { id } });
        if (!payment) {
            throw new common_1.NotFoundException('Pagamento nao encontrado.');
        }
        if (payment.billingProvider !== 'asaas' || !payment.providerPaymentId) {
            throw new common_1.BadRequestException('Pagamento nao possui vinculo com provedor para sincronizacao.');
        }
        const providerPayment = await this.asaasBillingService.getPayment(payment.providerPaymentId);
        return this.applyProviderPaymentToLocal(payment, providerPayment);
    }
    async processAsaasWebhook(payload, token) {
        const expectedToken = this.configService.get('ASAAS_WEBHOOK_TOKEN');
        if (expectedToken && expectedToken !== token) {
            throw new common_1.UnauthorizedException('Webhook do Asaas nao autorizado.');
        }
        const paymentData = payload.payment && typeof payload.payment === 'object' ? payload.payment : null;
        const providerPaymentId = paymentData && typeof paymentData.id === 'string' ? paymentData.id : null;
        const externalReference = paymentData && typeof paymentData.externalReference === 'string'
            ? paymentData.externalReference
            : null;
        if (!providerPaymentId && !externalReference) {
            throw new common_1.BadRequestException('Webhook do Asaas sem identificador de pagamento.');
        }
        let payment = null;
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
    paginate(items, totalCount, page, pageSize) {
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
    toPaymentResponse(payment) {
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
    toSubscriptionResponse(subscription) {
        return {
            ...subscription,
            price: Number(subscription.price),
            durationInDays: Number(subscription.durationInDays),
            qrCodeLimit: Number(subscription.qrCodeLimit),
        };
    }
    async getSubscriptionEntity(id) {
        const subscription = await this.subscriptionsRepository.findOne({ where: { id } });
        if (!subscription) {
            throw new common_1.NotFoundException('Plano nao encontrado.');
        }
        return subscription;
    }
    async getShopEntity(shopId) {
        const shop = await this.shopsRepository.findOne({ where: { id: shopId } });
        if (!shop) {
            throw new common_1.BadRequestException('Loja nao encontrada.');
        }
        return shop;
    }
    async getOptionalUser(userId) {
        if (!userId) {
            return null;
        }
        const user = await this.usersRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.BadRequestException('Usuario nao encontrado.');
        }
        return user;
    }
    isPaidStatus(status) {
        return ['paid', 'active', 'succeeded', 'authorized', 'received'].includes(status.toLowerCase());
    }
    normalizeProviderStatus(status) {
        const normalized = (status ?? 'pending').toLowerCase();
        const providerMap = {
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
    resolveBillingTerms(subscription, requestedCycle) {
        const baseCycle = subscription.type === 'Yearly' ? create_billing_checkout_dto_1.BillingCycle.Yearly : create_billing_checkout_dto_1.BillingCycle.Monthly;
        const billingCycle = requestedCycle ?? baseCycle;
        const rawPrice = Number(subscription.price);
        const baseDuration = Number(subscription.durationInDays || (baseCycle === create_billing_checkout_dto_1.BillingCycle.Yearly ? 365 : 30));
        if (billingCycle === baseCycle) {
            return {
                billingCycle,
                amount: rawPrice,
                durationInDays: baseDuration,
                installmentAmount: billingCycle === create_billing_checkout_dto_1.BillingCycle.Yearly
                    ? Number((rawPrice / 12).toFixed(2))
                    : rawPrice,
                label: billingCycle === create_billing_checkout_dto_1.BillingCycle.Yearly ? 'anual' : 'mensal',
            };
        }
        if (billingCycle === create_billing_checkout_dto_1.BillingCycle.Yearly) {
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
    async applyProviderPaymentToLocal(payment, providerPaymentRaw) {
        payment.billingProvider = 'asaas';
        payment.status = this.normalizeProviderStatus(typeof providerPaymentRaw.status === 'string'
            ? providerPaymentRaw.status
            : payment.status);
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
        const pixTransaction = providerPaymentRaw.pixTransaction &&
            typeof providerPaymentRaw.pixTransaction === 'object' &&
            !Array.isArray(providerPaymentRaw.pixTransaction)
            ? providerPaymentRaw.pixTransaction
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
            throw new common_1.NotFoundException('Pagamento atualizado nao encontrado.');
        }
        return this.toPaymentResponse(loaded);
    }
    toDateOnly(date) {
        return date.toISOString().slice(0, 10);
    }
};
exports.SubscriptionsService = SubscriptionsService;
exports.SubscriptionsService = SubscriptionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, typeorm_1.InjectRepository)(subscription_entity_1.SubscriptionEntity)),
    __param(3, (0, typeorm_1.InjectRepository)(subscription_payment_entity_1.SubscriptionPaymentEntity)),
    __param(4, (0, typeorm_1.InjectRepository)(shop_entity_1.ShopEntity)),
    __param(5, (0, typeorm_1.InjectRepository)(user_entity_1.UserEntity)),
    __metadata("design:paramtypes", [config_1.ConfigService,
        asaas_billing_service_1.AsaasBillingService,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], SubscriptionsService);
