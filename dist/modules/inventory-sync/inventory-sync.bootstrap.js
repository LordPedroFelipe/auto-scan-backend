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
var InventorySyncBootstrap_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventorySyncBootstrap = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const inventory_sync_service_1 = require("./inventory-sync.service");
let InventorySyncBootstrap = InventorySyncBootstrap_1 = class InventorySyncBootstrap {
    constructor(inventorySyncService, configService) {
        this.inventorySyncService = inventorySyncService;
        this.configService = configService;
        this.logger = new common_1.Logger(InventorySyncBootstrap_1.name);
    }
    async onModuleInit() {
        await this.inventorySyncService.initializeSchedules();
        const runOnStartup = this.configService.get('INVENTORY_SYNC_RUN_ON_STARTUP', 'false') ===
            'true';
        if (runOnStartup) {
            this.logger.log('Executando sincronização automática na inicialização.');
            await this.inventorySyncService.syncEnabledShops('startup');
        }
    }
};
exports.InventorySyncBootstrap = InventorySyncBootstrap;
exports.InventorySyncBootstrap = InventorySyncBootstrap = InventorySyncBootstrap_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [inventory_sync_service_1.InventorySyncService,
        config_1.ConfigService])
], InventorySyncBootstrap);
