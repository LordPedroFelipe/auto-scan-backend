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
exports.SaleClosureEntity = exports.PaymentMethod = exports.NoSaleReason = exports.SaleGiftType = exports.SaleOutcomeType = void 0;
const typeorm_1 = require("typeorm");
const lead_entity_1 = require("../../leads/entities/lead.entity");
const shop_entity_1 = require("../../shops/entities/shop.entity");
const test_drive_entity_1 = require("../../test-drives/entities/test-drive.entity");
const user_entity_1 = require("../../users/entities/user.entity");
const vehicle_entity_1 = require("../../vehicles/entities/vehicle.entity");
var SaleOutcomeType;
(function (SaleOutcomeType) {
    SaleOutcomeType["Sale"] = "Sale";
    SaleOutcomeType["NoSale"] = "NoSale";
})(SaleOutcomeType || (exports.SaleOutcomeType = SaleOutcomeType = {}));
var SaleGiftType;
(function (SaleGiftType) {
    SaleGiftType["None"] = "None";
    SaleGiftType["FuelTank"] = "FuelTank";
    SaleGiftType["Documentation"] = "Documentation";
    SaleGiftType["Warranty"] = "Warranty";
    SaleGiftType["AccessoryKit"] = "AccessoryKit";
    SaleGiftType["ProtectionFilm"] = "ProtectionFilm";
    SaleGiftType["InsuranceBonus"] = "InsuranceBonus";
    SaleGiftType["ServicePackage"] = "ServicePackage";
    SaleGiftType["Other"] = "Other";
})(SaleGiftType || (exports.SaleGiftType = SaleGiftType = {}));
var NoSaleReason;
(function (NoSaleReason) {
    NoSaleReason["Price"] = "Price";
    NoSaleReason["CreditDenied"] = "CreditDenied";
    NoSaleReason["ChoseCompetitor"] = "ChoseCompetitor";
    NoSaleReason["NoContact"] = "NoContact";
    NoSaleReason["StockUnavailable"] = "StockUnavailable";
    NoSaleReason["PostponedDecision"] = "PostponedDecision";
    NoSaleReason["VehicleMismatch"] = "VehicleMismatch";
    NoSaleReason["Other"] = "Other";
    NoSaleReason["NotInformed"] = "NotInformed";
})(NoSaleReason || (exports.NoSaleReason = NoSaleReason = {}));
var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["Cash"] = "Cash";
    PaymentMethod["Financing"] = "Financing";
    PaymentMethod["Consorcio"] = "Consorcio";
    PaymentMethod["Pix"] = "Pix";
    PaymentMethod["BankTransfer"] = "BankTransfer";
    PaymentMethod["CreditCard"] = "CreditCard";
    PaymentMethod["TradeIn"] = "TradeIn";
    PaymentMethod["Other"] = "Other";
})(PaymentMethod || (exports.PaymentMethod = PaymentMethod = {}));
let SaleClosureEntity = class SaleClosureEntity {
};
exports.SaleClosureEntity = SaleClosureEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], SaleClosureEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], SaleClosureEntity.prototype, "shopId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], SaleClosureEntity.prototype, "leadId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", Object)
], SaleClosureEntity.prototype, "vehicleId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", Object)
], SaleClosureEntity.prototype, "sellerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", Object)
], SaleClosureEntity.prototype, "testDriveId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => shop_entity_1.ShopEntity, { nullable: false }),
    (0, typeorm_1.JoinColumn)({ name: 'shopId' }),
    __metadata("design:type", shop_entity_1.ShopEntity)
], SaleClosureEntity.prototype, "shop", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => lead_entity_1.LeadEntity, { nullable: false }),
    (0, typeorm_1.JoinColumn)({ name: 'leadId' }),
    __metadata("design:type", lead_entity_1.LeadEntity)
], SaleClosureEntity.prototype, "lead", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => vehicle_entity_1.VehicleEntity, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'vehicleId' }),
    __metadata("design:type", Object)
], SaleClosureEntity.prototype, "vehicle", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.UserEntity, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'sellerId' }),
    __metadata("design:type", Object)
], SaleClosureEntity.prototype, "seller", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => test_drive_entity_1.TestDriveEntity, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'testDriveId' }),
    __metadata("design:type", Object)
], SaleClosureEntity.prototype, "testDrive", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: SaleOutcomeType }),
    __metadata("design:type", String)
], SaleClosureEntity.prototype, "outcomeType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: PaymentMethod, nullable: true }),
    __metadata("design:type", Object)
], SaleClosureEntity.prototype, "paymentMethod", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: SaleGiftType, default: SaleGiftType.None }),
    __metadata("design:type", String)
], SaleClosureEntity.prototype, "giftType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: NoSaleReason, nullable: true }),
    __metadata("design:type", Object)
], SaleClosureEntity.prototype, "noSaleReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'numeric', precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], SaleClosureEntity.prototype, "listPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'numeric', precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], SaleClosureEntity.prototype, "salePrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'numeric', precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], SaleClosureEntity.prototype, "discountValue", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'numeric', precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], SaleClosureEntity.prototype, "discountPercent", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'numeric', precision: 12, scale: 2, nullable: true }),
    __metadata("design:type", Object)
], SaleClosureEntity.prototype, "entryValue", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Object)
], SaleClosureEntity.prototype, "installments", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], SaleClosureEntity.prototype, "tradeInAccepted", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], SaleClosureEntity.prototype, "tradeInDescription", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'numeric', precision: 12, scale: 2, nullable: true }),
    __metadata("design:type", Object)
], SaleClosureEntity.prototype, "commissionValue", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true, length: 160 }),
    __metadata("design:type", Object)
], SaleClosureEntity.prototype, "competitorName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true, length: 200 }),
    __metadata("design:type", Object)
], SaleClosureEntity.prototype, "accessoryDescription", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz' }),
    __metadata("design:type", Date)
], SaleClosureEntity.prototype, "closedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], SaleClosureEntity.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', default: () => "'{}'::jsonb" }),
    __metadata("design:type", Object)
], SaleClosureEntity.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], SaleClosureEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], SaleClosureEntity.prototype, "updatedAt", void 0);
exports.SaleClosureEntity = SaleClosureEntity = __decorate([
    (0, typeorm_1.Index)('IDX_sale_closure_shop_closed_at', ['shopId', 'closedAt']),
    (0, typeorm_1.Index)('UQ_sale_closure_lead', ['leadId'], { unique: true }),
    (0, typeorm_1.Entity)('sale_closures')
], SaleClosureEntity);
