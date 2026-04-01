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
exports.LeadEntity = exports.LeadStatus = void 0;
const typeorm_1 = require("typeorm");
const shop_entity_1 = require("../../shops/entities/shop.entity");
const user_entity_1 = require("../../users/entities/user.entity");
const vehicle_entity_1 = require("../../vehicles/entities/vehicle.entity");
var LeadStatus;
(function (LeadStatus) {
    LeadStatus["New"] = "New";
    LeadStatus["Contacted"] = "Contacted";
    LeadStatus["InProgress"] = "InProgress";
    LeadStatus["Qualified"] = "Qualified";
    LeadStatus["Negotiating"] = "Negotiating";
    LeadStatus["Won"] = "Won";
    LeadStatus["Lost"] = "Lost";
    LeadStatus["NoResponse"] = "NoResponse";
})(LeadStatus || (exports.LeadStatus = LeadStatus = {}));
let LeadEntity = class LeadEntity {
};
exports.LeadEntity = LeadEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], LeadEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", Object)
], LeadEntity.prototype, "shopId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", Object)
], LeadEntity.prototype, "vehicleId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", Object)
], LeadEntity.prototype, "sellerId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => shop_entity_1.ShopEntity, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'shopId' }),
    __metadata("design:type", Object)
], LeadEntity.prototype, "shop", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => vehicle_entity_1.VehicleEntity, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'vehicleId' }),
    __metadata("design:type", Object)
], LeadEntity.prototype, "vehicle", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.UserEntity, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'sellerId' }),
    __metadata("design:type", Object)
], LeadEntity.prototype, "seller", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 120 }),
    __metadata("design:type", String)
], LeadEntity.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true, length: 160 }),
    __metadata("design:type", Object)
], LeadEntity.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true, length: 40 }),
    __metadata("design:type", Object)
], LeadEntity.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true, length: 120 }),
    __metadata("design:type", Object)
], LeadEntity.prototype, "city", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true, length: 120 }),
    __metadata("design:type", Object)
], LeadEntity.prototype, "origin", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true, length: 120 }),
    __metadata("design:type", Object)
], LeadEntity.prototype, "originSource", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true, length: 120 }),
    __metadata("design:type", Object)
], LeadEntity.prototype, "originMedium", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true, length: 120 }),
    __metadata("design:type", Object)
], LeadEntity.prototype, "originCampaign", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true, length: 500 }),
    __metadata("design:type", Object)
], LeadEntity.prototype, "originReferrer", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], LeadEntity.prototype, "originUtmParams", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: LeadStatus,
        default: LeadStatus.New,
    }),
    __metadata("design:type", String)
], LeadEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], LeadEntity.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], LeadEntity.prototype, "hasBeenContacted", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz', nullable: true }),
    __metadata("design:type", Object)
], LeadEntity.prototype, "contactDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz', nullable: true }),
    __metadata("design:type", Object)
], LeadEntity.prototype, "lastContactDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], LeadEntity.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], LeadEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], LeadEntity.prototype, "updatedAt", void 0);
exports.LeadEntity = LeadEntity = __decorate([
    (0, typeorm_1.Entity)('leads')
], LeadEntity);
