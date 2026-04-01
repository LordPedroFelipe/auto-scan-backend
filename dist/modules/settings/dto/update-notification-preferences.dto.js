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
exports.UpdateNotificationPreferencesDto = exports.NotificationPreferenceDto = exports.NOTIFICATION_CATEGORY_KEYS = exports.NotificationFrequency = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
var NotificationFrequency;
(function (NotificationFrequency) {
    NotificationFrequency["Immediate"] = "immediate";
    NotificationFrequency["Daily"] = "daily";
    NotificationFrequency["Weekly"] = "weekly";
    NotificationFrequency["Monthly"] = "monthly";
})(NotificationFrequency || (exports.NotificationFrequency = NotificationFrequency = {}));
exports.NOTIFICATION_CATEGORY_KEYS = [
    'leads',
    'test_drives',
    'billing',
    'inventory',
    'platform',
];
class NotificationPreferenceDto {
}
exports.NotificationPreferenceDto = NotificationPreferenceDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: exports.NOTIFICATION_CATEGORY_KEYS, example: 'leads' }),
    (0, class_validator_1.IsIn)(exports.NOTIFICATION_CATEGORY_KEYS),
    __metadata("design:type", Object)
], NotificationPreferenceDto.prototype, "key", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], NotificationPreferenceDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], NotificationPreferenceDto.prototype, "whatsapp", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: false }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], NotificationPreferenceDto.prototype, "sms", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], NotificationPreferenceDto.prototype, "push", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: NotificationFrequency, example: NotificationFrequency.Immediate }),
    (0, class_validator_1.IsEnum)(NotificationFrequency),
    __metadata("design:type", String)
], NotificationPreferenceDto.prototype, "frequency", void 0);
class UpdateNotificationPreferencesDto {
}
exports.UpdateNotificationPreferencesDto = UpdateNotificationPreferencesDto;
__decorate([
    (0, swagger_1.ApiProperty)({ format: 'uuid' }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], UpdateNotificationPreferencesDto.prototype, "shopId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: NotificationPreferenceDto, isArray: true }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => NotificationPreferenceDto),
    __metadata("design:type", Array)
], UpdateNotificationPreferencesDto.prototype, "preferences", void 0);
