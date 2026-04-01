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
exports.UpdateShopPreferencesDto = exports.ShopPreferencesDto = exports.LeadRoutingMode = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
var LeadRoutingMode;
(function (LeadRoutingMode) {
    LeadRoutingMode["Manual"] = "manual";
    LeadRoutingMode["ShopOwner"] = "shop_owner";
    LeadRoutingMode["RoundRobin"] = "round_robin";
})(LeadRoutingMode || (exports.LeadRoutingMode = LeadRoutingMode = {}));
class ShopPreferencesDto {
}
exports.ShopPreferencesDto = ShopPreferencesDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: LeadRoutingMode, example: LeadRoutingMode.Manual }),
    (0, class_validator_1.IsEnum)(LeadRoutingMode),
    __metadata("design:type", String)
], ShopPreferencesDto.prototype, "leadRoutingMode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ShopPreferencesDto.prototype, "showVehiclePrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ShopPreferencesDto.prototype, "allowPublicTestDriveScheduling", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ShopPreferencesDto.prototype, "enablePublicCatalog", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: false }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ShopPreferencesDto.prototype, "receiveLeadsOutsideBusinessHours", void 0);
class UpdateShopPreferencesDto {
}
exports.UpdateShopPreferencesDto = UpdateShopPreferencesDto;
__decorate([
    (0, swagger_1.ApiProperty)({ format: 'uuid' }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], UpdateShopPreferencesDto.prototype, "shopId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: ShopPreferencesDto }),
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => ShopPreferencesDto),
    __metadata("design:type", ShopPreferencesDto)
], UpdateShopPreferencesDto.prototype, "preferences", void 0);
