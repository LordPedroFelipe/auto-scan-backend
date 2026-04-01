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
exports.VehicleEntity = void 0;
const typeorm_1 = require("typeorm");
const shop_entity_1 = require("../../shops/entities/shop.entity");
let VehicleEntity = class VehicleEntity {
};
exports.VehicleEntity = VehicleEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], VehicleEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], VehicleEntity.prototype, "shopId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => shop_entity_1.ShopEntity, (shop) => shop.vehicles, { nullable: false }),
    (0, typeorm_1.JoinColumn)({ name: 'shopId' }),
    __metadata("design:type", shop_entity_1.ShopEntity)
], VehicleEntity.prototype, "shop", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 80 }),
    __metadata("design:type", String)
], VehicleEntity.prototype, "brand", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 80 }),
    __metadata("design:type", String)
], VehicleEntity.prototype, "model", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true, length: 120 }),
    __metadata("design:type", Object)
], VehicleEntity.prototype, "version", void 0);
__decorate([
    (0, typeorm_1.Column)('int'),
    __metadata("design:type", Number)
], VehicleEntity.prototype, "year", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true, length: 20 }),
    __metadata("design:type", Object)
], VehicleEntity.prototype, "plate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true, length: 40 }),
    __metadata("design:type", Object)
], VehicleEntity.prototype, "color", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true, length: 40 }),
    __metadata("design:type", Object)
], VehicleEntity.prototype, "transmission", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true, length: 40 }),
    __metadata("design:type", Object)
], VehicleEntity.prototype, "fuelType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true, length: 40 }),
    __metadata("design:type", Object)
], VehicleEntity.prototype, "condition", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true, length: 40 }),
    __metadata("design:type", Object)
], VehicleEntity.prototype, "categoryType", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'int' }),
    __metadata("design:type", Object)
], VehicleEntity.prototype, "mileage", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'numeric', precision: 12, scale: 2 }),
    __metadata("design:type", Number)
], VehicleEntity.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true, length: 120 }),
    __metadata("design:type", Object)
], VehicleEntity.prototype, "city", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true, length: 80 }),
    __metadata("design:type", Object)
], VehicleEntity.prototype, "state", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'text' }),
    __metadata("design:type", Object)
], VehicleEntity.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'int' }),
    __metadata("design:type", Object)
], VehicleEntity.prototype, "ownersCount", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { array: true, default: '{}' }),
    __metadata("design:type", Array)
], VehicleEntity.prototype, "photoUrls", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { array: true, default: '{}' }),
    __metadata("design:type", Array)
], VehicleEntity.prototype, "originalPhotoUrls", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { array: true, default: '{}' }),
    __metadata("design:type", Array)
], VehicleEntity.prototype, "thumbnailPhotoUrls", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], VehicleEntity.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true, length: 80 }),
    __metadata("design:type", Object)
], VehicleEntity.prototype, "externalVehicleId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true, length: 80 }),
    __metadata("design:type", Object)
], VehicleEntity.prototype, "externalImportId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true, length: 60 }),
    __metadata("design:type", Object)
], VehicleEntity.prototype, "integrationSource", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], VehicleEntity.prototype, "externalRaw", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz', nullable: true }),
    __metadata("design:type", Object)
], VehicleEntity.prototype, "sourceUpdatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz', nullable: true }),
    __metadata("design:type", Object)
], VehicleEntity.prototype, "sourceLastSeenAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], VehicleEntity.prototype, "hasAuction", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], VehicleEntity.prototype, "hasAccident", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], VehicleEntity.prototype, "isFirstOwner", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], VehicleEntity.prototype, "isConsigned", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], VehicleEntity.prototype, "isOnOffer", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], VehicleEntity.prototype, "isHighlighted", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], VehicleEntity.prototype, "isSold", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], VehicleEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], VehicleEntity.prototype, "updatedAt", void 0);
exports.VehicleEntity = VehicleEntity = __decorate([
    (0, typeorm_1.Index)('IDX_vehicle_shop_external', ['shopId', 'externalVehicleId'], {
        unique: true,
        where: '"externalVehicleId" IS NOT NULL',
    }),
    (0, typeorm_1.Entity)('vehicles')
], VehicleEntity);
