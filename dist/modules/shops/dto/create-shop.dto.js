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
exports.CreateShopDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateShopDto {
}
exports.CreateShopDto = CreateShopDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'ScanDrive Premium Motors' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateShopDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Loja focada em seminovos premium.' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateShopDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '12345678000199' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(14, 18),
    __metadata("design:type", String)
], CreateShopDto.prototype, "cnpj", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'contato@loja.com.br' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], CreateShopDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '+55 11 4002-8922' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateShopDto.prototype, "phoneNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Av. Paulista, 1000' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateShopDto.prototype, "addressLine", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Sao Paulo' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateShopDto.prototype, "city", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'SP' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateShopDto.prototype, "state", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '01310-100' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateShopDto.prototype, "zipCode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 120, minimum: 0 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateShopDto.prototype, "qrCodeLimit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'https://fornecedor.com/feed.xml' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateShopDto.prototype, "inventoryFeedUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'POST' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateShopDto.prototype, "inventoryFeedMethod", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '{"Accept":"application/json"}' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateShopDto.prototype, "inventoryRequestHeaders", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '{"token":"abc"}' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateShopDto.prototype, "inventoryRequestBody", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'revenda-x' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateShopDto.prototype, "inventorySourceCode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'kafka-litoralcar-json' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateShopDto.prototype, "inventorySourceName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'https://302017-litoralcar-org.s3.unifique.cloud/litoralcar' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateShopDto.prototype, "inventoryImageBucketBaseUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ format: 'uuid' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateShopDto.prototype, "inventoryMasterUserId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ format: 'uuid' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateShopDto.prototype, "inventorySellerUserId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '0 */6 * * *' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateShopDto.prototype, "inventorySyncCron", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateShopDto.prototype, "inventorySyncEnabled", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ format: 'uuid' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateShopDto.prototype, "ownerId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateShopDto.prototype, "isActive", void 0);
