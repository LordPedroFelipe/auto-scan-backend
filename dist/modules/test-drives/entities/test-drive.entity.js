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
exports.TestDriveEntity = exports.TestDriveStatus = void 0;
const typeorm_1 = require("typeorm");
const lead_entity_1 = require("../../leads/entities/lead.entity");
const shop_entity_1 = require("../../shops/entities/shop.entity");
const vehicle_entity_1 = require("../../vehicles/entities/vehicle.entity");
var TestDriveStatus;
(function (TestDriveStatus) {
    TestDriveStatus["Pending"] = "Pending";
    TestDriveStatus["Confirmed"] = "Confirmed";
    TestDriveStatus["Canceled"] = "Canceled";
    TestDriveStatus["Completed"] = "Completed";
})(TestDriveStatus || (exports.TestDriveStatus = TestDriveStatus = {}));
let TestDriveEntity = class TestDriveEntity {
};
exports.TestDriveEntity = TestDriveEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], TestDriveEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], TestDriveEntity.prototype, "vehicleId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", Object)
], TestDriveEntity.prototype, "shopId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", Object)
], TestDriveEntity.prototype, "leadId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => vehicle_entity_1.VehicleEntity, { nullable: false }),
    (0, typeorm_1.JoinColumn)({ name: 'vehicleId' }),
    __metadata("design:type", vehicle_entity_1.VehicleEntity)
], TestDriveEntity.prototype, "vehicle", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => shop_entity_1.ShopEntity, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'shopId' }),
    __metadata("design:type", Object)
], TestDriveEntity.prototype, "shop", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => lead_entity_1.LeadEntity, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'leadId' }),
    __metadata("design:type", Object)
], TestDriveEntity.prototype, "lead", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 120 }),
    __metadata("design:type", String)
], TestDriveEntity.prototype, "customerName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true, length: 160 }),
    __metadata("design:type", Object)
], TestDriveEntity.prototype, "customerEmail", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true, length: 40 }),
    __metadata("design:type", Object)
], TestDriveEntity.prototype, "customerPhone", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz' }),
    __metadata("design:type", Date)
], TestDriveEntity.prototype, "preferredDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true, length: 20 }),
    __metadata("design:type", Object)
], TestDriveEntity.prototype, "preferredTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], TestDriveEntity.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: TestDriveStatus,
        default: TestDriveStatus.Pending,
    }),
    __metadata("design:type", String)
], TestDriveEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], TestDriveEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], TestDriveEntity.prototype, "updatedAt", void 0);
exports.TestDriveEntity = TestDriveEntity = __decorate([
    (0, typeorm_1.Entity)('test_drives')
], TestDriveEntity);
