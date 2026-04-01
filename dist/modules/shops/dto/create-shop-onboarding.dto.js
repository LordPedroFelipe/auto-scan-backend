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
exports.CreateShopOnboardingDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class CreateMasterUserDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Maria Gestora' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMasterUserDto.prototype, "userName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'maria@loja.com.br' }),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], CreateMasterUserDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Senha@123', minLength: 6 }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(6),
    __metadata("design:type", String)
], CreateMasterUserDto.prototype, "password", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '+55 11 99999-9999' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMasterUserDto.prototype, "phoneNumber", void 0);
class CreateShopOnboardingDto {
}
exports.CreateShopOnboardingDto = CreateShopOnboardingDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'ScanDrive Motors' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateShopOnboardingDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Loja criada pelo fluxo de onboarding.' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateShopOnboardingDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '12345678000199' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(14, 18),
    __metadata("design:type", String)
], CreateShopOnboardingDto.prototype, "cnpj", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'contato@loja.com.br' }),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], CreateShopOnboardingDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '+55 11 4002-8922' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateShopOnboardingDto.prototype, "phoneNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Av. Brasil, 500' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateShopOnboardingDto.prototype, "addressLine", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Campinas' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateShopOnboardingDto.prototype, "city", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'SP' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateShopOnboardingDto.prototype, "state", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '13010-000' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateShopOnboardingDto.prototype, "zipCode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 50, minimum: 0 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateShopOnboardingDto.prototype, "qrCodeLimit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'https://fornecedor.com/feed.xml' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateShopOnboardingDto.prototype, "inventoryFeedUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'revenda-x' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateShopOnboardingDto.prototype, "inventorySourceCode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '0 */6 * * *' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateShopOnboardingDto.prototype, "inventorySyncCron", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateShopOnboardingDto.prototype, "inventorySyncEnabled", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: CreateMasterUserDto }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => CreateMasterUserDto),
    __metadata("design:type", CreateMasterUserDto)
], CreateShopOnboardingDto.prototype, "masterUser", void 0);
