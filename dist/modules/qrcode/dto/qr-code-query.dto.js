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
exports.QrCodeQueryDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const toNumber = ({ value }) => value === undefined || value === null || value === '' ? undefined : Number(value);
class QrCodeQueryDto {
    constructor() {
        this.pageNumber = 1;
        this.pageSize = 10;
    }
}
exports.QrCodeQueryDto = QrCodeQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ format: 'uuid' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], QrCodeQueryDto.prototype, "shopId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], QrCodeQueryDto.prototype, "ShopId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'ABC1D23' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QrCodeQueryDto.prototype, "vehiclePlate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QrCodeQueryDto.prototype, "VehiclePlate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'vehicle' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QrCodeQueryDto.prototype, "redirectType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QrCodeQueryDto.prototype, "RedirectType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 1, minimum: 1 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(toNumber),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], QrCodeQueryDto.prototype, "pageNumber", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(toNumber),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], QrCodeQueryDto.prototype, "PageNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 10, minimum: 1 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(toNumber),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], QrCodeQueryDto.prototype, "pageSize", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(toNumber),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], QrCodeQueryDto.prototype, "PageSize", void 0);
