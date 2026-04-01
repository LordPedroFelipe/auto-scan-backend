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
exports.SalesGoalEntity = exports.SalesGoalType = void 0;
const typeorm_1 = require("typeorm");
const shop_entity_1 = require("../../shops/entities/shop.entity");
const user_entity_1 = require("../../users/entities/user.entity");
var SalesGoalType;
(function (SalesGoalType) {
    SalesGoalType["ShopMonthly"] = "ShopMonthly";
    SalesGoalType["SellerMonthly"] = "SellerMonthly";
    SalesGoalType["Campaign"] = "Campaign";
})(SalesGoalType || (exports.SalesGoalType = SalesGoalType = {}));
let SalesGoalEntity = class SalesGoalEntity {
};
exports.SalesGoalEntity = SalesGoalEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], SalesGoalEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], SalesGoalEntity.prototype, "shopId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", Object)
], SalesGoalEntity.prototype, "sellerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", Object)
], SalesGoalEntity.prototype, "campaignId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => shop_entity_1.ShopEntity, { nullable: false }),
    (0, typeorm_1.JoinColumn)({ name: 'shopId' }),
    __metadata("design:type", shop_entity_1.ShopEntity)
], SalesGoalEntity.prototype, "shop", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.UserEntity, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'sellerId' }),
    __metadata("design:type", Object)
], SalesGoalEntity.prototype, "seller", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: SalesGoalType }),
    __metadata("design:type", String)
], SalesGoalEntity.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], SalesGoalEntity.prototype, "year", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], SalesGoalEntity.prototype, "month", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true, length: 100 }),
    __metadata("design:type", Object)
], SalesGoalEntity.prototype, "campaignName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'numeric', precision: 12, scale: 2 }),
    __metadata("design:type", Number)
], SalesGoalEntity.prototype, "targetValue", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'numeric', precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], SalesGoalEntity.prototype, "currentValue", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Object)
], SalesGoalEntity.prototype, "startDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Object)
], SalesGoalEntity.prototype, "endDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], SalesGoalEntity.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], SalesGoalEntity.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', default: () => "'{}'::jsonb" }),
    __metadata("design:type", Object)
], SalesGoalEntity.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], SalesGoalEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], SalesGoalEntity.prototype, "updatedAt", void 0);
exports.SalesGoalEntity = SalesGoalEntity = __decorate([
    (0, typeorm_1.Index)('IDX_sales_goal_shop_year_month', ['shopId', 'year', 'month']),
    (0, typeorm_1.Index)('IDX_sales_goal_seller_year_month', ['sellerId', 'year', 'month']),
    (0, typeorm_1.Entity)('sales_goals')
], SalesGoalEntity);
