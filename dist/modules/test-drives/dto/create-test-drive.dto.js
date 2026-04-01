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
exports.CreateTestDriveDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const test_drive_entity_1 = require("../entities/test-drive.entity");
class CreateTestDriveDto {
}
exports.CreateTestDriveDto = CreateTestDriveDto;
__decorate([
    (0, swagger_1.ApiProperty)({ format: 'uuid' }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateTestDriveDto.prototype, "vehicleId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ format: 'uuid' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateTestDriveDto.prototype, "shopId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateTestDriveDto.prototype, "leadId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Fernanda Compradora' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTestDriveDto.prototype, "customerName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], CreateTestDriveDto.prototype, "customerEmail", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTestDriveDto.prototype, "customerPhone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-04-02' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTestDriveDto.prototype, "preferredDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTestDriveDto.prototype, "preferredTime", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTestDriveDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: test_drive_entity_1.TestDriveStatus, example: test_drive_entity_1.TestDriveStatus.Pending }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(test_drive_entity_1.TestDriveStatus),
    __metadata("design:type", String)
], CreateTestDriveDto.prototype, "status", void 0);
