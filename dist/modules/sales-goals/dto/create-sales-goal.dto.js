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
exports.SalesGoalsQueryDto = exports.UpdateSalesGoalDto = exports.CreateSalesGoalDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const sales_goal_entity_1 = require("../entities/sales-goal.entity");
class CreateSalesGoalDto {
}
exports.CreateSalesGoalDto = CreateSalesGoalDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: sales_goal_entity_1.SalesGoalType, example: sales_goal_entity_1.SalesGoalType.ShopMonthly }),
    (0, class_validator_1.IsEnum)(sales_goal_entity_1.SalesGoalType),
    __metadata("design:type", String)
], CreateSalesGoalDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 2024 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(2020),
    __metadata("design:type", Number)
], CreateSalesGoalDto.prototype, "year", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 3, minimum: 1, maximum: 12 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateSalesGoalDto.prototype, "month", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 500000.00 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateSalesGoalDto.prototype, "targetValue", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Meta mensal da loja' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSalesGoalDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ format: 'uuid' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateSalesGoalDto.prototype, "sellerId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ format: 'uuid' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateSalesGoalDto.prototype, "shopId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Campanha de março' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSalesGoalDto.prototype, "campaignName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ format: 'uuid' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateSalesGoalDto.prototype, "campaignId", void 0);
class UpdateSalesGoalDto {
}
exports.UpdateSalesGoalDto = UpdateSalesGoalDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 600000.00 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateSalesGoalDto.prototype, "targetValue", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Meta atualizada' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateSalesGoalDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: 'boolean' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdateSalesGoalDto.prototype, "isActive", void 0);
class SalesGoalsQueryDto {
}
exports.SalesGoalsQueryDto = SalesGoalsQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2024' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SalesGoalsQueryDto.prototype, "year", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '3' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SalesGoalsQueryDto.prototype, "month", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: sales_goal_entity_1.SalesGoalType }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(sales_goal_entity_1.SalesGoalType),
    __metadata("design:type", String)
], SalesGoalsQueryDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ format: 'uuid' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], SalesGoalsQueryDto.prototype, "sellerId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ format: 'uuid' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], SalesGoalsQueryDto.prototype, "shopId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: 'boolean' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], SalesGoalsQueryDto.prototype, "isActive", void 0);
