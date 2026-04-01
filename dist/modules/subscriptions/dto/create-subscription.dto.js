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
exports.CreateSubscriptionDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateSubscriptionDto {
}
exports.CreateSubscriptionDto = CreateSubscriptionDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Plano Premium' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSubscriptionDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Plano com IA, estoque e relatorios.' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSubscriptionDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'plano-start' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSubscriptionDto.prototype, "slug", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'START_399' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSubscriptionDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 799, minimum: 0 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateSubscriptionDto.prototype, "price", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 30, minimum: 1 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateSubscriptionDto.prototype, "durationInDays", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 500, minimum: 0 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateSubscriptionDto.prototype, "qrCodeLimit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['Monthly', 'Yearly'], example: 'Monthly' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(['Monthly', 'Yearly']),
    __metadata("design:type", String)
], CreateSubscriptionDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: ['Cadastro de até 20 veículos', 'IA comercial inicial', 'Agendamento de test drive'],
        type: [String],
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], CreateSubscriptionDto.prototype, "benefits", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Mais vendido' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSubscriptionDto.prototype, "marketingBadge", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 10, minimum: 0 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateSubscriptionDto.prototype, "displayOrder", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateSubscriptionDto.prototype, "isFeatured", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateSubscriptionDto.prototype, "isPromotional", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateSubscriptionDto.prototype, "isActive", void 0);
