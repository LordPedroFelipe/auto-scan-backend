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
exports.CreateVehicleDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const toOptionalString = ({ value }) => {
    if (value === undefined || value === null || value === '') {
        return undefined;
    }
    return String(value).trim();
};
const toOptionalNumber = ({ value }) => {
    if (value === undefined || value === null || value === '') {
        return undefined;
    }
    const parsed = Number(value);
    return Number.isNaN(parsed) ? value : parsed;
};
const toOptionalBoolean = ({ value }) => {
    if (value === undefined || value === null || value === '') {
        return undefined;
    }
    if (typeof value === 'boolean') {
        return value;
    }
    if (typeof value === 'string') {
        const normalized = value.trim().toLowerCase();
        if (normalized === 'true') {
            return true;
        }
        if (normalized === 'false') {
            return false;
        }
    }
    return value;
};
const toStringArray = ({ value }) => {
    if (value === undefined || value === null || value === '') {
        return undefined;
    }
    if (Array.isArray(value)) {
        return value.filter((item) => typeof item === 'string' && item.trim().length > 0);
    }
    if (typeof value === 'string') {
        try {
            const parsed = JSON.parse(value);
            if (Array.isArray(parsed)) {
                return parsed.filter((item) => typeof item === 'string' && item.trim().length > 0);
            }
        }
        catch {
            return value
                .split(',')
                .map((item) => item.trim())
                .filter(Boolean);
        }
    }
    return undefined;
};
class CreateVehicleDto {
}
exports.CreateVehicleDto = CreateVehicleDto;
__decorate([
    (0, swagger_1.ApiProperty)({ format: 'uuid' }),
    (0, class_transformer_1.Transform)(toOptionalString),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateVehicleDto.prototype, "shopId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Toyota' }),
    (0, class_transformer_1.Transform)(toOptionalString),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateVehicleDto.prototype, "brand", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Corolla' }),
    (0, class_transformer_1.Transform)(toOptionalString),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateVehicleDto.prototype, "model", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'XEi 2.0 CVT' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(toOptionalString),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateVehicleDto.prototype, "version", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 2023, minimum: 1900 }),
    (0, class_transformer_1.Transform)(toOptionalNumber),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1900),
    __metadata("design:type", Number)
], CreateVehicleDto.prototype, "year", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(toOptionalString),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateVehicleDto.prototype, "plate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(toOptionalString),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateVehicleDto.prototype, "color", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(toOptionalString),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateVehicleDto.prototype, "transmission", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(toOptionalString),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateVehicleDto.prototype, "fuelType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(toOptionalString),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateVehicleDto.prototype, "condition", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(toOptionalString),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateVehicleDto.prototype, "categoryType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(toOptionalNumber),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateVehicleDto.prototype, "mileage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 119900, minimum: 0 }),
    (0, class_transformer_1.Transform)(toOptionalNumber),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateVehicleDto.prototype, "price", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(toOptionalString),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateVehicleDto.prototype, "city", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(toOptionalString),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateVehicleDto.prototype, "state", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(toOptionalString),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateVehicleDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(toOptionalNumber),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateVehicleDto.prototype, "ownersCount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: ['https://cdn.site.com/foto-1.webp'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(toStringArray),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], CreateVehicleDto.prototype, "photoUrls", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: ['https://cdn.site.com/foto-1.webp'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(toStringArray),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], CreateVehicleDto.prototype, "retainedPhotoUrls", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(toOptionalBoolean),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateVehicleDto.prototype, "hasAuction", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(toOptionalBoolean),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateVehicleDto.prototype, "hasAccident", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(toOptionalBoolean),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateVehicleDto.prototype, "isFirstOwner", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(toOptionalBoolean),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateVehicleDto.prototype, "isConsigned", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(toOptionalBoolean),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateVehicleDto.prototype, "isOnOffer", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(toOptionalBoolean),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateVehicleDto.prototype, "isHighlighted", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(toOptionalBoolean),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateVehicleDto.prototype, "isSold", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(toOptionalBoolean),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateVehicleDto.prototype, "isActive", void 0);
