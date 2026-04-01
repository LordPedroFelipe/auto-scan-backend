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
exports.UserEntity = void 0;
const typeorm_1 = require("typeorm");
const shop_entity_1 = require("../../shops/entities/shop.entity");
let UserEntity = class UserEntity {
    normalizeEmail() {
        this.email = this.email.toLowerCase();
    }
};
exports.UserEntity = UserEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], UserEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 120 }),
    __metadata("design:type", String)
], UserEntity.prototype, "userName", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true, length: 160 }),
    __metadata("design:type", String)
], UserEntity.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true, length: 40 }),
    __metadata("design:type", Object)
], UserEntity.prototype, "phoneNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', select: false, nullable: true }),
    __metadata("design:type", String)
], UserEntity.prototype, "passwordHash", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], UserEntity.prototype, "emailConfirmed", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], UserEntity.prototype, "lockoutEnabled", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], UserEntity.prototype, "accessFailedCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], UserEntity.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true, length: 128 }),
    __metadata("design:type", Object)
], UserEntity.prototype, "passwordResetTokenHash", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Object)
], UserEntity.prototype, "passwordResetExpiresAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Object)
], UserEntity.prototype, "welcomeEmailSentAt", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-array', { default: 'Seller' }),
    __metadata("design:type", Array)
], UserEntity.prototype, "roles", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-array', { default: '' }),
    __metadata("design:type", Array)
], UserEntity.prototype, "claims", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", Object)
], UserEntity.prototype, "shopId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => shop_entity_1.ShopEntity, (shop) => shop.users, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'shopId' }),
    __metadata("design:type", Object)
], UserEntity.prototype, "shop", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], UserEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], UserEntity.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    (0, typeorm_1.BeforeUpdate)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], UserEntity.prototype, "normalizeEmail", null);
exports.UserEntity = UserEntity = __decorate([
    (0, typeorm_1.Entity)('users')
], UserEntity);
