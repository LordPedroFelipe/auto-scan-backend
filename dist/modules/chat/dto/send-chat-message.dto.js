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
exports.SendChatMessageDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class SendChatMessageDto {
}
exports.SendChatMessageDto = SendChatMessageDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'session-123' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendChatMessageDto.prototype, "sessionId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Quero um SUV ate 120 mil.', maxLength: 4000 }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(4000),
    __metadata("design:type", String)
], SendChatMessageDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ format: 'uuid' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], SendChatMessageDto.prototype, "shopId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ format: 'uuid' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], SendChatMessageDto.prototype, "vehicleId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'ABC1D23' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendChatMessageDto.prototype, "plate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Carlos' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendChatMessageDto.prototype, "customerName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'carlos@email.com' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], SendChatMessageDto.prototype, "customerEmail", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendChatMessageDto.prototype, "customerPhone", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendChatMessageDto.prototype, "customerCity", void 0);
