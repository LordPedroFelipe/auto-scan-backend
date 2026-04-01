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
exports.TestDrivesQueryDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const toNumber = ({ value }) => value === undefined || value === null || value === '' ? undefined : Number(value);
class TestDrivesQueryDto {
    constructor() {
        this.pageNumber = 1;
        this.pageSize = 10;
    }
}
exports.TestDrivesQueryDto = TestDrivesQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Fernanda' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TestDrivesQueryDto.prototype, "customerName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TestDrivesQueryDto.prototype, "CustomerName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TestDrivesQueryDto.prototype, "vehicleModel", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TestDrivesQueryDto.prototype, "VehicleModel", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'pending' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TestDrivesQueryDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TestDrivesQueryDto.prototype, "Status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], TestDrivesQueryDto.prototype, "shopId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], TestDrivesQueryDto.prototype, "ShopId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 1, minimum: 1 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(toNumber),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], TestDrivesQueryDto.prototype, "pageNumber", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(toNumber),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], TestDrivesQueryDto.prototype, "PageNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 10, minimum: 1 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(toNumber),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], TestDrivesQueryDto.prototype, "pageSize", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(toNumber),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], TestDrivesQueryDto.prototype, "PageSize", void 0);
