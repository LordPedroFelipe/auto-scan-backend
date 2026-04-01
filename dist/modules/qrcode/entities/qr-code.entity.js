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
exports.QrCodeEntity = void 0;
const typeorm_1 = require("typeorm");
let QrCodeEntity = class QrCodeEntity {
};
exports.QrCodeEntity = QrCodeEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], QrCodeEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], QrCodeEntity.prototype, "shopId", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 40 }),
    __metadata("design:type", String)
], QrCodeEntity.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255 }),
    __metadata("design:type", String)
], QrCodeEntity.prototype, "link", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true, length: 100 }),
    __metadata("design:type", Object)
], QrCodeEntity.prototype, "redirectId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true, length: 50 }),
    __metadata("design:type", Object)
], QrCodeEntity.prototype, "redirectType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true, length: 20 }),
    __metadata("design:type", Object)
], QrCodeEntity.prototype, "vehiclePlate", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], QrCodeEntity.prototype, "createdAt", void 0);
exports.QrCodeEntity = QrCodeEntity = __decorate([
    (0, typeorm_1.Entity)('qr_codes')
], QrCodeEntity);
