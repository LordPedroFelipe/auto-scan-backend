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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionPaymentEntity = void 0;
const typeorm_1 = require("typeorm");
const shop_entity_1 = require("../../shops/entities/shop.entity");
const subscription_entity_1 = require("./subscription.entity");
const user_entity_1 = require("../../users/entities/user.entity");
let SubscriptionPaymentEntity = class SubscriptionPaymentEntity {
};
exports.SubscriptionPaymentEntity = SubscriptionPaymentEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], SubscriptionPaymentEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], SubscriptionPaymentEntity.prototype, "subscriptionId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => subscription_entity_1.SubscriptionEntity, { nullable: false }),
    (0, typeorm_1.JoinColumn)({ name: 'subscriptionId' }),
    __metadata("design:type", subscription_entity_1.SubscriptionEntity)
], SubscriptionPaymentEntity.prototype, "subscription", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", Object)
], SubscriptionPaymentEntity.prototype, "shopId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => shop_entity_1.ShopEntity, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'shopId' }),
    __metadata("design:type", Object)
], SubscriptionPaymentEntity.prototype, "shop", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", Object)
], SubscriptionPaymentEntity.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.UserEntity, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", Object)
], SubscriptionPaymentEntity.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], SubscriptionPaymentEntity.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], SubscriptionPaymentEntity.prototype, "startDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], SubscriptionPaymentEntity.prototype, "endDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 40, default: 'pending' }),
    __metadata("design:type", String)
], SubscriptionPaymentEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], SubscriptionPaymentEntity.prototype, "invoiceUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true, length: 40 }),
    __metadata("design:type", Object)
], SubscriptionPaymentEntity.prototype, "billingProvider", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true, length: 80 }),
    __metadata("design:type", Object)
], SubscriptionPaymentEntity.prototype, "paymentMethod", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true, length: 160 }),
    __metadata("design:type", Object)
], SubscriptionPaymentEntity.prototype, "providerPaymentId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true, length: 160 }),
    __metadata("design:type", Object)
], SubscriptionPaymentEntity.prototype, "providerCustomerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true, length: 160 }),
    __metadata("design:type", Object)
], SubscriptionPaymentEntity.prototype, "externalReference", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true, length: 255 }),
    __metadata("design:type", Object)
], SubscriptionPaymentEntity.prototype, "pixQrCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], SubscriptionPaymentEntity.prototype, "pixCopyPaste", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Object)
], SubscriptionPaymentEntity.prototype, "dueDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Object)
], SubscriptionPaymentEntity.prototype, "paidAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], SubscriptionPaymentEntity.prototype, "providerPayload", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], SubscriptionPaymentEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], SubscriptionPaymentEntity.prototype, "updatedAt", void 0);
exports.SubscriptionPaymentEntity = SubscriptionPaymentEntity = __decorate([
    (0, typeorm_1.Entity)('subscription_payments')
], SubscriptionPaymentEntity);
