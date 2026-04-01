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
exports.SubscriptionsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const asaas_webhook_dto_1 = require("./dto/asaas-webhook.dto");
const create_billing_checkout_dto_1 = require("./dto/create-billing-checkout.dto");
const create_subscription_payment_dto_1 = require("./dto/create-subscription-payment.dto");
const create_subscription_dto_1 = require("./dto/create-subscription.dto");
const subscription_payments_query_dto_1 = require("./dto/subscription-payments-query.dto");
const update_subscription_dto_1 = require("./dto/update-subscription.dto");
const subscriptions_service_1 = require("./subscriptions.service");
let SubscriptionsController = class SubscriptionsController {
    constructor(subscriptionsService) {
        this.subscriptionsService = subscriptionsService;
    }
    listSubscriptions(query) {
        return this.subscriptionsService.listSubscriptions(query);
    }
    getSubscription(id) {
        return this.subscriptionsService.getSubscription(id);
    }
    createSubscription(dto) {
        return this.subscriptionsService.createSubscription(dto);
    }
    updateSubscription(id, dto) {
        return this.subscriptionsService.updateSubscription(id, dto);
    }
    removeSubscription(id) {
        return this.subscriptionsService.removeSubscription(id);
    }
    listPayments(query) {
        return this.subscriptionsService.listPayments(query);
    }
    listPaymentsByShop(shopId, query) {
        return this.subscriptionsService.listPayments(query, shopId);
    }
    createPayment(shopId, subscriptionId, dto) {
        return this.subscriptionsService.createPayment(shopId, subscriptionId, dto);
    }
    createCheckout(shopId, subscriptionId, dto) {
        return this.subscriptionsService.createCheckout(shopId, subscriptionId, dto);
    }
    syncPayment(id) {
        return this.subscriptionsService.syncPaymentStatus(id);
    }
    handleAsaasWebhook(body, token) {
        return this.subscriptionsService.processAsaasWebhook(body, token);
    }
};
exports.SubscriptionsController = SubscriptionsController;
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Listar planos de assinatura' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('Subscriptions'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [subscription_payments_query_dto_1.SubscriptionPaymentsQueryDto]),
    __metadata("design:returntype", void 0)
], SubscriptionsController.prototype, "listSubscriptions", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Obter detalhes de um plano' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('Subscriptions/:id'),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SubscriptionsController.prototype, "getSubscription", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Criar plano de assinatura' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('Subscriptions'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_subscription_dto_1.CreateSubscriptionDto]),
    __metadata("design:returntype", void 0)
], SubscriptionsController.prototype, "createSubscription", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Atualizar plano de assinatura' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Put)('Subscriptions/:id'),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_subscription_dto_1.UpdateSubscriptionDto]),
    __metadata("design:returntype", void 0)
], SubscriptionsController.prototype, "updateSubscription", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Remover plano de assinatura' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Delete)('Subscriptions/:id'),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SubscriptionsController.prototype, "removeSubscription", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Listar pagamentos de assinatura' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('SubscriptionPayments'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [subscription_payments_query_dto_1.SubscriptionPaymentsQueryDto]),
    __metadata("design:returntype", void 0)
], SubscriptionsController.prototype, "listPayments", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Listar pagamentos de uma loja especifica' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('SubscriptionPayments/shop/:shopId'),
    __param(0, (0, common_1.Param)('shopId', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, subscription_payments_query_dto_1.SubscriptionPaymentsQueryDto]),
    __metadata("design:returntype", void 0)
], SubscriptionsController.prototype, "listPaymentsByShop", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Criar pagamento para uma assinatura de loja' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('SubscriptionPayments/shop/:shopId/subscription/:subscriptionId'),
    __param(0, (0, common_1.Param)('shopId', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Param)('subscriptionId', new common_1.ParseUUIDPipe())),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, create_subscription_payment_dto_1.CreateSubscriptionPaymentDto]),
    __metadata("design:returntype", void 0)
], SubscriptionsController.prototype, "createPayment", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Gerar checkout de cobranca no Asaas para uma assinatura de loja' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('SubscriptionPayments/shop/:shopId/subscription/:subscriptionId/checkout'),
    __param(0, (0, common_1.Param)('shopId', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Param)('subscriptionId', new common_1.ParseUUIDPipe())),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, create_billing_checkout_dto_1.CreateBillingCheckoutDto]),
    __metadata("design:returntype", void 0)
], SubscriptionsController.prototype, "createCheckout", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Sincronizar status de um pagamento com o provedor' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('SubscriptionPayments/:id/sync'),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SubscriptionsController.prototype, "syncPayment", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Receber webhooks do Asaas para conciliacao de cobranca' }),
    (0, common_1.Post)('Billing/webhooks/asaas'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('asaas-access-token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [asaas_webhook_dto_1.AsaasWebhookDto, String]),
    __metadata("design:returntype", void 0)
], SubscriptionsController.prototype, "handleAsaasWebhook", null);
exports.SubscriptionsController = SubscriptionsController = __decorate([
    (0, swagger_1.ApiTags)('Subscriptions'),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [subscriptions_service_1.SubscriptionsService])
], SubscriptionsController);
