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
exports.InventorySyncLogEntity = void 0;
const typeorm_1 = require("typeorm");
let InventorySyncLogEntity = class InventorySyncLogEntity {
};
exports.InventorySyncLogEntity = InventorySyncLogEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], InventorySyncLogEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], InventorySyncLogEntity.prototype, "shopId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 160 }),
    __metadata("design:type", String)
], InventorySyncLogEntity.prototype, "shopName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true, length: 500 }),
    __metadata("design:type", Object)
], InventorySyncLogEntity.prototype, "inventoryFeedUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true, length: 80 }),
    __metadata("design:type", Object)
], InventorySyncLogEntity.prototype, "inventorySourceCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true, length: 120 }),
    __metadata("design:type", Object)
], InventorySyncLogEntity.prototype, "inventorySourceName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true, length: 120 }),
    __metadata("design:type", Object)
], InventorySyncLogEntity.prototype, "inventorySyncCron", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], InventorySyncLogEntity.prototype, "inventorySyncEnabled", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20 }),
    __metadata("design:type", String)
], InventorySyncLogEntity.prototype, "triggerType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20 }),
    __metadata("design:type", String)
], InventorySyncLogEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], InventorySyncLogEntity.prototype, "imported", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], InventorySyncLogEntity.prototype, "created", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], InventorySyncLogEntity.prototype, "updated", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], InventorySyncLogEntity.prototype, "deactivated", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], InventorySyncLogEntity.prototype, "totalInFeed", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], InventorySyncLogEntity.prototype, "activeIntegratedVehicles", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], InventorySyncLogEntity.prototype, "durationMs", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz' }),
    __metadata("design:type", Date)
], InventorySyncLogEntity.prototype, "startedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz' }),
    __metadata("design:type", Date)
], InventorySyncLogEntity.prototype, "finishedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], InventorySyncLogEntity.prototype, "errorMessage", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', default: () => "'{}'::jsonb" }),
    __metadata("design:type", Object)
], InventorySyncLogEntity.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], InventorySyncLogEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], InventorySyncLogEntity.prototype, "updatedAt", void 0);
exports.InventorySyncLogEntity = InventorySyncLogEntity = __decorate([
    (0, typeorm_1.Entity)('inventory_sync_logs')
], InventorySyncLogEntity);
