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
exports.DashboardController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../auth/current-user.decorator");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const dashboard_service_1 = require("./dashboard.service");
let DashboardController = class DashboardController {
    constructor(dashboardService) {
        this.dashboardService = dashboardService;
    }
    home(user, periodDays, sellerId, leadOrigin) {
        return this.dashboardService.getDashboardForUser(user, periodDays, sellerId, leadOrigin);
    }
    system(user, periodDays) {
        return this.dashboardService.getSystemDashboard(user, periodDays);
    }
    shop(user, periodDays, sellerId, leadOrigin) {
        return this.dashboardService.getShopDashboard(user, periodDays, sellerId, leadOrigin);
    }
    seller(user, periodDays) {
        return this.dashboardService.getSellerDashboard(user, periodDays);
    }
};
exports.DashboardController = DashboardController;
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Obter resumo do dashboard apropriado para o papel do usuario autenticado' }),
    (0, common_1.Get)('home'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('periodDays')),
    __param(2, (0, common_1.Query)('sellerId')),
    __param(3, (0, common_1.Query)('leadOrigin')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", void 0)
], DashboardController.prototype, "home", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Obter dashboard global do admin do sistema' }),
    (0, common_1.Get)('system'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('periodDays')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], DashboardController.prototype, "system", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Obter dashboard operacional da loja' }),
    (0, common_1.Get)('shop'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('periodDays')),
    __param(2, (0, common_1.Query)('sellerId')),
    __param(3, (0, common_1.Query)('leadOrigin')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", void 0)
], DashboardController.prototype, "shop", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Obter dashboard pessoal do vendedor' }),
    (0, common_1.Get)('seller'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('periodDays')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], DashboardController.prototype, "seller", null);
exports.DashboardController = DashboardController = __decorate([
    (0, swagger_1.ApiTags)('Dashboard'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('Dashboard'),
    __metadata("design:paramtypes", [dashboard_service_1.DashboardService])
], DashboardController);
