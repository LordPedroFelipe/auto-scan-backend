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
exports.InventorySyncController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../auth/current-user.decorator");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const inventory_sync_logs_query_dto_1 = require("./dto/inventory-sync-logs-query.dto");
const inventory_sync_service_1 = require("./inventory-sync.service");
let InventorySyncController = class InventorySyncController {
    constructor(inventorySyncService) {
        this.inventorySyncService = inventorySyncService;
    }
    runShop(shopId) {
        return this.inventorySyncService.syncShopInventory(shopId, { triggerType: 'manual' });
    }
    runEnabled() {
        return this.inventorySyncService.syncEnabledShops('bulk');
    }
    getStatus(shopId) {
        return this.inventorySyncService.getShopSyncStatus(shopId);
    }
    listLogs(query, user) {
        return this.inventorySyncService.listLogs(query, user);
    }
    getLogById(logId, user) {
        return this.inventorySyncService.getLogById(logId, user);
    }
};
exports.InventorySyncController = InventorySyncController;
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Executar sincronizacao de estoque de uma loja' }),
    (0, common_1.Post)('shops/:shopId/run'),
    __param(0, (0, common_1.Param)('shopId', new common_1.ParseUUIDPipe())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], InventorySyncController.prototype, "runShop", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Executar sincronizacao de todas as lojas habilitadas' }),
    (0, common_1.Post)('run-enabled'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], InventorySyncController.prototype, "runEnabled", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Consultar status de sincronizacao de uma loja' }),
    (0, common_1.Get)('shops/:shopId/status'),
    __param(0, (0, common_1.Param)('shopId', new common_1.ParseUUIDPipe())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], InventorySyncController.prototype, "getStatus", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Listar logs de integracoes de estoque' }),
    (0, common_1.Get)('logs'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [inventory_sync_logs_query_dto_1.InventorySyncLogsQueryDto, Object]),
    __metadata("design:returntype", void 0)
], InventorySyncController.prototype, "listLogs", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Obter detalhes de um log de integracao' }),
    (0, common_1.Get)('logs/:logId'),
    __param(0, (0, common_1.Param)('logId', new common_1.ParseUUIDPipe())),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], InventorySyncController.prototype, "getLogById", null);
exports.InventorySyncController = InventorySyncController = __decorate([
    (0, swagger_1.ApiTags)('InventorySync'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('InventorySync'),
    __metadata("design:paramtypes", [inventory_sync_service_1.InventorySyncService])
], InventorySyncController);
