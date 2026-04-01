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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const settings_overview_query_dto_1 = require("./dto/settings-overview-query.dto");
const shop_settings_query_dto_1 = require("./dto/shop-settings-query.dto");
const update_notification_preferences_dto_1 = require("./dto/update-notification-preferences.dto");
const update_shop_preferences_dto_1 = require("./dto/update-shop-preferences.dto");
const settings_service_1 = require("./settings.service");
let SettingsController = class SettingsController {
    constructor(settingsService) {
        this.settingsService = settingsService;
    }
    getOverview(query) {
        return this.settingsService.getOverview(query.shopId);
    }
    getShopPreferences(query) {
        return this.settingsService.getShopPreferences(query.shopId);
    }
    updateShopPreferences(body) {
        return this.settingsService.updateShopPreferences(body.shopId, body.preferences);
    }
    getNotificationPreferences(query) {
        return this.settingsService.getNotificationPreferences(query.shopId);
    }
    updateNotificationPreferences(body) {
        return this.settingsService.updateNotificationPreferences(body.shopId, body.preferences);
    }
};
exports.SettingsController = SettingsController;
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Obter overview consolidado de configuracoes e cobranca' }),
    (0, common_1.Get)('overview'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [settings_overview_query_dto_1.SettingsOverviewQueryDto]),
    __metadata("design:returntype", void 0)
], SettingsController.prototype, "getOverview", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Obter preferencias operacionais da loja' }),
    (0, common_1.Get)('preferences'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [shop_settings_query_dto_1.ShopSettingsQueryDto]),
    __metadata("design:returntype", void 0)
], SettingsController.prototype, "getShopPreferences", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Salvar preferencias operacionais da loja' }),
    (0, common_1.Put)('preferences'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_shop_preferences_dto_1.UpdateShopPreferencesDto]),
    __metadata("design:returntype", void 0)
], SettingsController.prototype, "updateShopPreferences", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Obter preferencias de notificacao da loja' }),
    (0, common_1.Get)('notifications'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [shop_settings_query_dto_1.ShopSettingsQueryDto]),
    __metadata("design:returntype", void 0)
], SettingsController.prototype, "getNotificationPreferences", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Salvar preferencias de notificacao da loja' }),
    (0, common_1.Put)('notifications'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_notification_preferences_dto_1.UpdateNotificationPreferencesDto]),
    __metadata("design:returntype", void 0)
], SettingsController.prototype, "updateNotificationPreferences", null);
exports.SettingsController = SettingsController = __decorate([
    (0, swagger_1.ApiTags)('Settings'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('Settings'),
    __metadata("design:paramtypes", [settings_service_1.SettingsService])
], SettingsController);
