"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionsModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const shop_entity_1 = require("../shops/entities/shop.entity");
const user_entity_1 = require("../users/entities/user.entity");
const asaas_billing_service_1 = require("./asaas-billing.service");
const subscription_payment_entity_1 = require("./entities/subscription-payment.entity");
const subscription_entity_1 = require("./entities/subscription.entity");
const subscriptions_controller_1 = require("./subscriptions.controller");
const subscriptions_service_1 = require("./subscriptions.service");
let SubscriptionsModule = class SubscriptionsModule {
};
exports.SubscriptionsModule = SubscriptionsModule;
exports.SubscriptionsModule = SubscriptionsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule,
            typeorm_1.TypeOrmModule.forFeature([
                subscription_entity_1.SubscriptionEntity,
                subscription_payment_entity_1.SubscriptionPaymentEntity,
                shop_entity_1.ShopEntity,
                user_entity_1.UserEntity,
            ]),
        ],
        controllers: [subscriptions_controller_1.SubscriptionsController],
        providers: [subscriptions_service_1.SubscriptionsService, asaas_billing_service_1.AsaasBillingService],
    })
], SubscriptionsModule);
