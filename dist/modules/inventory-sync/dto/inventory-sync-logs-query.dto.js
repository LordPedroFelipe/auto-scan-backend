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
exports.InventorySyncLogsQueryDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class InventorySyncLogsQueryDto {
    constructor() {
        this.page = 1;
        this.pageSize = 10;
    }
}
exports.InventorySyncLogsQueryDto = InventorySyncLogsQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 1, default: 1 }),
    (0, class_transformer_1.Transform)(({ value }) => Number(value ?? 1)),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Object)
], InventorySyncLogsQueryDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 10, enum: [10, 20, 50], default: 10 }),
    (0, class_transformer_1.Transform)(({ value }) => Number(value ?? 10)),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsIn)([10, 20, 50]),
    __metadata("design:type", Object)
], InventorySyncLogsQueryDto.prototype, "pageSize", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'kafka' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], InventorySyncLogsQueryDto.prototype, "search", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'success', enum: ['success', 'error'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['success', 'error']),
    __metadata("design:type", String)
], InventorySyncLogsQueryDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'manual', enum: ['manual', 'cron', 'startup', 'bulk'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['manual', 'cron', 'startup', 'bulk']),
    __metadata("design:type", String)
], InventorySyncLogsQueryDto.prototype, "triggerType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ format: 'uuid' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], InventorySyncLogsQueryDto.prototype, "shopId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2026-03-01' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], InventorySyncLogsQueryDto.prototype, "dateFrom", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2026-03-30' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], InventorySyncLogsQueryDto.prototype, "dateTo", void 0);
