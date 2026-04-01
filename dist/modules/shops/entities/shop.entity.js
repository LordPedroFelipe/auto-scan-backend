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
exports.ShopEntity = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
const vehicle_entity_1 = require("../../vehicles/entities/vehicle.entity");
let ShopEntity = class ShopEntity {
};
exports.ShopEntity = ShopEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ShopEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 160 }),
    __metadata("design:type", String)
], ShopEntity.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], ShopEntity.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true, length: 18 }),
    __metadata("design:type", Object)
], ShopEntity.prototype, "cnpj", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true, length: 160 }),
    __metadata("design:type", Object)
], ShopEntity.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true, length: 40 }),
    __metadata("design:type", Object)
], ShopEntity.prototype, "phoneNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true, length: 255 }),
    __metadata("design:type", Object)
], ShopEntity.prototype, "addressLine", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true, length: 100 }),
    __metadata("design:type", Object)
], ShopEntity.prototype, "city", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true, length: 80 }),
    __metadata("design:type", Object)
], ShopEntity.prototype, "state", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true, length: 20 }),
    __metadata("design:type", Object)
], ShopEntity.prototype, "zipCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 10 }),
    __metadata("design:type", Number)
], ShopEntity.prototype, "qrCodeLimit", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true, length: 500 }),
    __metadata("design:type", Object)
], ShopEntity.prototype, "inventoryFeedUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true, length: 10 }),
    __metadata("design:type", Object)
], ShopEntity.prototype, "inventoryFeedMethod", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], ShopEntity.prototype, "inventoryRequestBody", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], ShopEntity.prototype, "inventoryRequestHeaders", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true, length: 80 }),
    __metadata("design:type", Object)
], ShopEntity.prototype, "inventorySourceCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true, length: 120 }),
    __metadata("design:type", Object)
], ShopEntity.prototype, "inventorySourceName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true, length: 500 }),
    __metadata("design:type", Object)
], ShopEntity.prototype, "inventoryImageBucketBaseUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", Object)
], ShopEntity.prototype, "inventoryMasterUserId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", Object)
], ShopEntity.prototype, "inventorySellerUserId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true, length: 120 }),
    __metadata("design:type", Object)
], ShopEntity.prototype, "inventorySyncCron", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], ShopEntity.prototype, "inventorySyncEnabled", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz', nullable: true }),
    __metadata("design:type", Object)
], ShopEntity.prototype, "inventoryLastSyncAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true, length: 40 }),
    __metadata("design:type", Object)
], ShopEntity.prototype, "inventoryLastSyncStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], ShopEntity.prototype, "inventoryLastSyncError", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', default: () => "'{}'::jsonb" }),
    __metadata("design:type", Object)
], ShopEntity.prototype, "settingsPreferences", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', default: () => "'[]'::jsonb" }),
    __metadata("design:type", Array)
], ShopEntity.prototype, "notificationPreferences", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true, length: 40 }),
    __metadata("design:type", Object)
], ShopEntity.prototype, "billingCustomerProvider", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true, length: 120 }),
    __metadata("design:type", Object)
], ShopEntity.prototype, "billingCustomerExternalId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz', nullable: true }),
    __metadata("design:type", Object)
], ShopEntity.prototype, "billingCustomerSyncedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", Object)
], ShopEntity.prototype, "ownerId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.UserEntity, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'ownerId' }),
    __metadata("design:type", Object)
], ShopEntity.prototype, "owner", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => user_entity_1.UserEntity, (user) => user.shop),
    __metadata("design:type", Array)
], ShopEntity.prototype, "users", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => vehicle_entity_1.VehicleEntity, (vehicle) => vehicle.shop),
    __metadata("design:type", Array)
], ShopEntity.prototype, "vehicles", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], ShopEntity.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], ShopEntity.prototype, "isDeleted", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ShopEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], ShopEntity.prototype, "updatedAt", void 0);
exports.ShopEntity = ShopEntity = __decorate([
    (0, typeorm_1.Entity)('shops')
], ShopEntity);
