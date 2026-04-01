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
var InventorySyncService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventorySyncService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const cron_1 = require("cron");
const schedule_1 = require("@nestjs/schedule");
const typeorm_2 = require("typeorm");
const qrcode_service_1 = require("../qrcode/qrcode.service");
const shop_entity_1 = require("../shops/entities/shop.entity");
const vehicle_entity_1 = require("../vehicles/entities/vehicle.entity");
const inventory_sync_log_entity_1 = require("./entities/inventory-sync-log.entity");
const inventory_sync_constants_1 = require("./inventory-sync.constants");
let InventorySyncService = InventorySyncService_1 = class InventorySyncService {
    constructor(shopsRepository, vehiclesRepository, inventorySyncLogRepository, schedulerRegistry, qrCodeService) {
        this.shopsRepository = shopsRepository;
        this.vehiclesRepository = vehiclesRepository;
        this.inventorySyncLogRepository = inventorySyncLogRepository;
        this.schedulerRegistry = schedulerRegistry;
        this.qrCodeService = qrCodeService;
        this.logger = new common_1.Logger(InventorySyncService_1.name);
    }
    async initializeSchedules() {
        const cronJobs = this.schedulerRegistry.getCronJobs();
        for (const [name] of cronJobs) {
            if (name.startsWith('inventory-sync:')) {
                this.schedulerRegistry.deleteCronJob(name);
            }
        }
        const shops = await this.shopsRepository.find({
            where: {
                inventorySyncEnabled: true,
            },
            order: {
                name: 'ASC',
            },
        });
        for (const shop of shops) {
            this.registerShopCron(shop);
        }
    }
    async syncEnabledShops(triggerType = 'bulk') {
        const shops = await this.shopsRepository.find({
            where: {
                inventorySyncEnabled: true,
            },
            order: {
                name: 'ASC',
            },
        });
        const results = [];
        for (const shop of shops) {
            results.push(await this.syncShopInventory(shop.id, { triggerType }));
        }
        return results;
    }
    async getShopSyncStatus(shopId) {
        const shop = await this.shopsRepository.findOne({
            where: { id: shopId },
            select: {
                id: true,
                name: true,
                inventoryFeedUrl: true,
                inventoryFeedMethod: true,
                inventorySourceCode: true,
                inventorySyncCron: true,
                inventorySyncEnabled: true,
                inventoryLastSyncAt: true,
                inventoryLastSyncStatus: true,
                inventoryLastSyncError: true,
            },
        });
        if (!shop) {
            throw new common_1.NotFoundException('Loja nÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¾Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â£o encontrada para sincronizaÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¾Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¾Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â£o.');
        }
        const activeVehicles = await this.vehiclesRepository.count({
            where: {
                shopId,
                isActive: true,
                integrationSource: this.resolveIntegrationSource(shop),
            },
        });
        return {
            shopId: shop.id,
            shopName: shop.name,
            inventoryFeedUrl: shop.inventoryFeedUrl,
            inventoryFeedMethod: shop.inventoryFeedMethod ?? 'GET',
            inventorySourceCode: shop.inventorySourceCode,
            inventorySyncCron: shop.inventorySyncCron ?? inventory_sync_constants_1.DEFAULT_INVENTORY_SYNC_CRON,
            inventorySyncEnabled: shop.inventorySyncEnabled,
            inventoryLastSyncAt: shop.inventoryLastSyncAt,
            inventoryLastSyncStatus: shop.inventoryLastSyncStatus,
            inventoryLastSyncError: shop.inventoryLastSyncError,
            activeIntegratedVehicles: activeVehicles,
        };
    }
    async listLogs(query, user) {
        this.ensureAdmin(user);
        const page = Math.max(1, Number(query.page ?? 1));
        const pageSize = [10, 20, 50].includes(Number(query.pageSize)) ? Number(query.pageSize) : 10;
        const qb = this.inventorySyncLogRepository.createQueryBuilder('log');
        if (query.shopId) {
            qb.andWhere('log.shopId = :shopId', { shopId: query.shopId });
        }
        if (query.status) {
            qb.andWhere('log.status = :status', { status: query.status });
        }
        if (query.triggerType) {
            qb.andWhere('log.triggerType = :triggerType', { triggerType: query.triggerType });
        }
        if (query.search?.trim()) {
            const search = `%${query.search.trim().toLowerCase()}%`;
            qb.andWhere(`
          LOWER(log.shopName) LIKE :search
          OR LOWER(COALESCE(log.inventorySourceName, '')) LIKE :search
          OR LOWER(COALESCE(log.inventorySourceCode, '')) LIKE :search
          OR LOWER(COALESCE(log.inventoryFeedUrl, '')) LIKE :search
          OR LOWER(COALESCE(log.errorMessage, '')) LIKE :search
        `, { search });
        }
        if (query.dateFrom) {
            qb.andWhere('log.startedAt >= :dateFrom', { dateFrom: `${query.dateFrom}T00:00:00.000Z` });
        }
        if (query.dateTo) {
            qb.andWhere('log.startedAt <= :dateTo', { dateTo: `${query.dateTo}T23:59:59.999Z` });
        }
        qb.orderBy('log.startedAt', 'DESC');
        const [items, totalCount, successCount, errorCount] = await Promise.all([
            qb.clone().skip((page - 1) * pageSize).take(pageSize).getMany(),
            qb.clone().getCount(),
            qb.clone().andWhere('log.status = :successStatus', { successStatus: 'success' }).getCount(),
            qb.clone().andWhere('log.status = :errorStatus', { errorStatus: 'error' }).getCount(),
        ]);
        return {
            items,
            page,
            pageSize,
            totalCount,
            successCount,
            errorCount,
        };
    }
    async getLogById(logId, user) {
        this.ensureAdmin(user);
        const log = await this.inventorySyncLogRepository.findOne({
            where: { id: logId },
        });
        if (!log) {
            throw new common_1.NotFoundException('Log de integracao nao encontrado.');
        }
        return log;
    }
    async syncShopInventory(shopId, options) {
        const startedAt = new Date();
        const triggerType = options?.triggerType ?? 'manual';
        const shop = await this.shopsRepository.findOne({
            where: { id: shopId },
        });
        if (!shop) {
            throw new common_1.NotFoundException('Loja nÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¾Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â£o encontrada para sincronizaÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¾Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¾Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â£o.');
        }
        try {
            const feedUrl = shop.inventoryFeedUrl?.trim();
            if (!feedUrl) {
                throw new Error('Loja sem URL de feed configurada para sincronizacao.');
            }
            const integrationSource = this.resolveIntegrationSource(shop);
            const feed = await this.fetchFeed(shop);
            const now = new Date();
            const activeRecords = (feed.veiculos ?? []).filter((record) => record.situacao === '1' && !!record.cod_veiculo);
            const existingVehicles = await this.vehiclesRepository.find({
                where: {
                    shopId,
                    integrationSource,
                },
            });
            const existingByExternalId = new Map(existingVehicles
                .filter((vehicle) => !!vehicle.externalVehicleId)
                .map((vehicle) => [vehicle.externalVehicleId, vehicle]));
            const vehiclesToSave = [];
            const seenExternalIds = new Set();
            let created = 0;
            let updated = 0;
            for (const record of activeRecords) {
                const externalVehicleId = String(record.cod_veiculo);
                seenExternalIds.add(externalVehicleId);
                const existing = existingByExternalId.get(externalVehicleId);
                const entity = existing ?? this.vehiclesRepository.create();
                const isNew = !existing;
                this.applyExternalVehicle(entity, shop, feed, record, now, integrationSource);
                vehiclesToSave.push(entity);
                if (isNew)
                    created += 1;
                else
                    updated += 1;
            }
            if (vehiclesToSave.length > 0) {
                const savedVehicles = await this.vehiclesRepository.save(vehiclesToSave);
                await Promise.all(savedVehicles.map((vehicle) => this.qrCodeService.ensureVehicleQrCode(vehicle.shopId, vehicle.id, vehicle.plate)));
            }
            const vehiclesToDeactivate = existingVehicles.filter((vehicle) => vehicle.externalVehicleId && !seenExternalIds.has(vehicle.externalVehicleId));
            if (vehiclesToDeactivate.length > 0) {
                for (const vehicle of vehiclesToDeactivate) {
                    vehicle.isActive = false;
                    vehicle.isOnOffer = false;
                    vehicle.isHighlighted = false;
                    vehicle.sourceLastSeenAt = now;
                }
                await this.vehiclesRepository.save(vehiclesToDeactivate);
            }
            shop.inventoryLastSyncAt = now;
            shop.inventoryLastSyncStatus = 'success';
            shop.inventoryLastSyncError = null;
            await this.shopsRepository.save(shop);
            const result = {
                shopId: shop.id,
                shopName: shop.name,
                imported: activeRecords.length,
                created,
                updated,
                deactivated: vehiclesToDeactivate.length,
                totalInFeed: feed.total ?? activeRecords.length,
                syncedAt: now.toISOString(),
            };
            this.logger.log(`Estoque sincronizado para ${shop.name}: ${created} criados, ${updated} atualizados, ${vehiclesToDeactivate.length} desativados.`);
            await this.registerLog({
                shop,
                startedAt,
                finishedAt: new Date(),
                triggerType,
                status: 'success',
                imported: activeRecords.length,
                created,
                updated,
                deactivated: vehiclesToDeactivate.length,
                totalInFeed: feed.total ?? activeRecords.length,
                activeIntegratedVehicles: activeRecords.length,
                errorMessage: null,
                metadata: {
                    integrationSource,
                    feedStoreCode: feed.cod_loja,
                    inventoryFeedMethod: shop.inventoryFeedMethod ?? 'GET',
                },
            });
            return result;
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Erro desconhecido ao sincronizar estoque.';
            shop.inventoryLastSyncStatus = 'error';
            shop.inventoryLastSyncError = message;
            await this.shopsRepository.save(shop);
            await this.registerLog({
                shop,
                startedAt,
                finishedAt: new Date(),
                triggerType,
                status: 'error',
                imported: 0,
                created: 0,
                updated: 0,
                deactivated: 0,
                totalInFeed: 0,
                activeIntegratedVehicles: 0,
                errorMessage: message,
                metadata: {
                    inventoryFeedUrl: shop.inventoryFeedUrl,
                    inventoryFeedMethod: shop.inventoryFeedMethod ?? 'GET',
                },
            });
            throw error;
        }
    }
    registerShopCron(shop) {
        const cronExpression = shop.inventorySyncCron ?? inventory_sync_constants_1.DEFAULT_INVENTORY_SYNC_CRON;
        const jobName = `inventory-sync:${shop.id}`;
        const job = new cron_1.CronJob(cronExpression, async () => {
            try {
                await this.syncShopInventory(shop.id, { triggerType: 'cron' });
            }
            catch (error) {
                const message = error instanceof Error ? error.message : 'Erro desconhecido no cron de estoque.';
                this.logger.error(`Falha no cron de sincronizaÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¾Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¾Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â£o da loja ${shop.name}: ${message}`);
            }
        });
        this.schedulerRegistry.addCronJob(jobName, job);
        job.start();
        this.logger.log(`Cron de estoque registrado para ${shop.name}: ${cronExpression}`);
    }
    async fetchFeed(shop) {
        const feedUrl = shop.inventoryFeedUrl?.trim();
        if (!feedUrl) {
            throw new Error('URL do feed nao configurada para esta loja.');
        }
        const method = this.resolveFeedMethod(shop.inventoryFeedMethod);
        const headers = this.resolveFeedHeaders(shop.inventoryRequestHeaders);
        if (!headers.has('Accept')) {
            headers.set('Accept', 'application/json');
        }
        if (method === 'POST') {
            const cookieHeader = await this.resolveWarmupCookies(feedUrl, headers);
            if (cookieHeader) {
                headers.set('Cookie', cookieHeader);
            }
        }
        const requestInit = {
            method,
            headers,
        };
        const body = this.resolveFeedBody(shop.inventoryRequestBody, headers);
        if (body !== undefined && method !== 'GET') {
            requestInit.body = body;
        }
        const response = await fetch(feedUrl, requestInit);
        if (!response.ok) {
            throw new Error(`Falha ao buscar feed ${feedUrl}: ${response.status}`);
        }
        const rawPayload = await response.text();
        let payload;
        try {
            payload = JSON.parse(rawPayload);
        }
        catch {
            throw new Error('Feed retornou um payload que nao e JSON valido.');
        }
        if (!payload?.veiculos || !Array.isArray(payload.veiculos)) {
            throw new Error('Feed de estoque invalido: lista de veiculos nao encontrada.');
        }
        return payload;
    }
    async resolveWarmupCookies(feedUrl, headers) {
        const referer = headers.get('Referer')?.trim();
        const warmupUrl = referer || this.resolveWarmupUrl(feedUrl);
        const warmupHeaders = new Headers();
        const userAgent = headers.get('User-Agent');
        if (userAgent) {
            warmupHeaders.set('User-Agent', userAgent);
        }
        const acceptLanguage = headers.get('Accept-Language');
        if (acceptLanguage) {
            warmupHeaders.set('Accept-Language', acceptLanguage);
        }
        const origin = headers.get('Origin');
        if (origin) {
            warmupHeaders.set('Origin', origin);
        }
        const response = await fetch(warmupUrl, {
            method: 'GET',
            headers: warmupHeaders,
        });
        if (!response.ok) {
            throw new Error(`Falha ao preparar sessao do feed: ${response.status}`);
        }
        const getSetCookie = response.headers.getSetCookie;
        const cookies = typeof getSetCookie === 'function' ? getSetCookie.call(response.headers) : [];
        if (!cookies.length) {
            return null;
        }
        return cookies
            .map((cookie) => cookie.split(';', 1)[0]?.trim())
            .filter((cookie) => !!cookie)
            .join('; ');
    }
    resolveWarmupUrl(feedUrl) {
        const parsed = new URL(feedUrl);
        return `${parsed.origin}/`;
    }
    resolveFeedMethod(value) {
        const normalized = value?.trim().toUpperCase();
        if (!normalized) {
            return 'GET';
        }
        if (normalized !== 'GET' && normalized !== 'POST') {
            throw new Error(`Metodo de feed nao suportado: ${normalized}.`);
        }
        return normalized;
    }
    resolveFeedHeaders(value) {
        const headers = new Headers();
        const raw = value?.trim();
        if (!raw) {
            return headers;
        }
        let parsed;
        try {
            parsed = JSON.parse(raw);
        }
        catch {
            throw new Error('Headers customizados invalidos: use um JSON valido.');
        }
        if (!parsed || Array.isArray(parsed) || typeof parsed !== 'object') {
            throw new Error('Headers customizados invalidos: informe um objeto JSON.');
        }
        for (const [key, headerValue] of Object.entries(parsed)) {
            if (headerValue === null || headerValue === undefined) {
                continue;
            }
            headers.set(key, String(headerValue));
        }
        return headers;
    }
    resolveFeedBody(value, headers) {
        const raw = value?.trim();
        if (!raw) {
            return undefined;
        }
        if (headers && !headers.has('Content-Type') && /^[\[{]/.test(raw)) {
            headers.set('Content-Type', 'application/json; charset=UTF-8');
        }
        return raw;
    }
    applyExternalVehicle(entity, shop, feed, record, now, integrationSource) {
        const photoCollections = this.buildPhotoCollections(shop, feed, record, integrationSource);
        entity.shopId = shop.id;
        entity.brand = this.safeString(record.marca, 80);
        entity.model = this.safeString(record.modelo, 80);
        entity.version = this.nullableString(record.versao ?? record.veiculo, 120);
        entity.year = this.parseIntSafe(record.ano, now.getFullYear());
        entity.plate = this.nullableString(record.placa?.toUpperCase(), 20);
        entity.color = this.nullableString(record.cor, 40);
        entity.transmission = this.mapTransmission(record.cambio);
        entity.fuelType = this.nullableString(record.combustivel, 40);
        entity.condition = this.nullableString(record.estado, 40);
        entity.categoryType = this.nullableString(record.tipo_categoria, 40);
        entity.mileage = this.parseNullableInt(record.km);
        entity.price = this.resolvePrice(record);
        entity.city = this.nullableString(record.cidade ?? shop.city ?? undefined, 120);
        entity.state = this.nullableString(record.uf ?? shop.state ?? undefined, 80);
        entity.description = this.nullableString(record.obs_site || record.obs);
        entity.ownersCount = null;
        entity.photoUrls = photoCollections.originalPhotoUrls;
        entity.originalPhotoUrls = photoCollections.originalPhotoUrls;
        entity.thumbnailPhotoUrls = photoCollections.thumbnailPhotoUrls;
        entity.isActive = true;
        entity.isSold = false;
        entity.isOnOffer = this.parseNumber(record.valor_oferta) > 0 || record.em_oferta === 'sim';
        entity.isHighlighted = record.destaqueSite === '1';
        entity.hasAccident = false;
        entity.hasAuction = false;
        entity.isFirstOwner = false;
        entity.isConsigned = false;
        entity.externalVehicleId = String(record.cod_veiculo);
        entity.externalImportId = this.nullableString(record.cod_importacao);
        entity.integrationSource = integrationSource;
        entity.externalRaw = record;
        entity.sourceUpdatedAt = this.parseNullableDate(record.data_cad);
        entity.sourceLastSeenAt = now;
    }
    buildPhotoCollections(shop, feed, record, integrationSource) {
        const strategy = this.resolveImageStrategy(shop, feed);
        const originalPhotoUrls = (record.fotos ?? []).map((filename) => strategy.buildOriginalUrl(feed, record, this.normalizePhotoFilename(integrationSource, filename)));
        const thumbnailPhotoUrls = (record.fotos ?? []).map((filename) => strategy.buildThumbnailUrl(feed, record, this.normalizePhotoFilename(integrationSource, filename)));
        return {
            originalPhotoUrls,
            thumbnailPhotoUrls,
        };
    }
    resolveImageStrategy(shop, feed) {
        const bucketBaseUrl = shop.inventoryImageBucketBaseUrl?.trim();
        const storeCode = this.nullableString(feed.cod_loja ?? shop.inventorySourceCode ?? undefined);
        return {
            buildOriginalUrl: (_feed, record, filename) => this.buildPhotoUrl(bucketBaseUrl, storeCode, filename, record),
            buildThumbnailUrl: (_feed, record, filename) => this.buildPhotoUrl(bucketBaseUrl, storeCode, filename, record),
        };
    }
    normalizePhotoFilename(integrationSource, filename) {
        if (!integrationSource.toLowerCase().includes('litoralcar')) {
            return filename;
        }
        const trimmed = filename.trim();
        if (!trimmed) {
            return trimmed;
        }
        if (/-\d{3}\.[a-z0-9]+$/i.test(trimmed)) {
            return trimmed;
        }
        const extensionMatch = trimmed.match(/(\.[a-z0-9]+)$/i);
        if (!extensionMatch) {
            return trimmed + '-004';
        }
        const extension = extensionMatch[1];
        return trimmed.slice(0, -extension.length) + '-004' + extension;
    }
    buildPhotoUrl(bucketBaseUrl, storeCode, filename, record) {
        const trimmed = filename.trim();
        if (!trimmed) {
            return trimmed;
        }
        if (/^https?:\/\//i.test(trimmed)) {
            return trimmed;
        }
        if (!bucketBaseUrl) {
            return trimmed;
        }
        if (bucketBaseUrl.includes('{filename}')) {
            return bucketBaseUrl
                .replace(/\{filename\}/g, encodeURIComponent(trimmed))
                .replace(/\{cod_loja\}/g, encodeURIComponent(storeCode ?? ''))
                .replace(/\{storeCode\}/g, encodeURIComponent(storeCode ?? ''))
                .replace(/\{cod_veiculo\}/g, encodeURIComponent(String(record?.cod_veiculo ?? '')))
                .replace(/\{externalVehicleId\}/g, encodeURIComponent(String(record?.cod_veiculo ?? '')));
        }
        const normalizedBase = bucketBaseUrl.replace(/\/+$/, '');
        return storeCode ? `${normalizedBase}/${storeCode}/${trimmed}` : `${normalizedBase}/${trimmed}`;
    }
    resolveIntegrationSource(shop) {
        return (this.nullableString(shop.inventorySourceName, 120) ??
            this.nullableString(shop.inventorySourceCode, 80) ??
            inventory_sync_constants_1.DEFAULT_INVENTORY_SOURCE_NAME);
    }
    ensureAdmin(user) {
        if (!user.roles?.includes('Admin')) {
            throw new common_1.ForbiddenException('Acesso restrito ao admin da plataforma.');
        }
    }
    async registerLog(params) {
        const durationMs = Math.max(params.finishedAt.getTime() - params.startedAt.getTime(), 0);
        const log = this.inventorySyncLogRepository.create({
            shopId: params.shop.id,
            shopName: params.shop.name,
            inventoryFeedUrl: params.shop.inventoryFeedUrl ?? null,
            inventorySourceCode: params.shop.inventorySourceCode ?? null,
            inventorySourceName: params.shop.inventorySourceName ?? null,
            inventorySyncCron: params.shop.inventorySyncCron ?? null,
            inventorySyncEnabled: params.shop.inventorySyncEnabled ?? false,
            triggerType: params.triggerType,
            status: params.status,
            imported: params.imported,
            created: params.created,
            updated: params.updated,
            deactivated: params.deactivated,
            totalInFeed: params.totalInFeed,
            activeIntegratedVehicles: params.activeIntegratedVehicles,
            durationMs,
            startedAt: params.startedAt,
            finishedAt: params.finishedAt,
            errorMessage: params.errorMessage,
            metadata: params.metadata ?? {},
        });
        await this.inventorySyncLogRepository.save(log);
    }
    resolvePrice(record) {
        const offer = this.parseNumber(record.valor_oferta);
        if (offer > 0) {
            return offer;
        }
        return this.parseNumber(record.valor);
    }
    parseNumber(value) {
        if (value === undefined || value === null || value === '') {
            return 0;
        }
        const normalized = typeof value === 'number' ? value : Number(String(value).replace(',', '.'));
        return Number.isFinite(normalized) ? normalized : 0;
    }
    parseIntSafe(value, fallback) {
        const normalized = Number.parseInt(String(value ?? ''), 10);
        return Number.isFinite(normalized) ? normalized : fallback;
    }
    parseNullableInt(value) {
        if (value === undefined || value === null || value === '') {
            return null;
        }
        const normalized = Number.parseInt(String(value), 10);
        return Number.isFinite(normalized) ? normalized : null;
    }
    parseNullableDate(value) {
        if (!value)
            return null;
        const parsed = new Date(value);
        return Number.isNaN(parsed.getTime()) ? null : parsed;
    }
    safeString(value, maxLength) {
        const normalized = (value ?? '').trim();
        return maxLength ? normalized.slice(0, maxLength) : normalized;
    }
    nullableString(value, maxLength) {
        const normalized = value?.trim();
        if (!normalized)
            return null;
        return maxLength ? normalized.slice(0, maxLength) : normalized;
    }
    mapTransmission(value) {
        if (!value)
            return null;
        const normalized = value.toLowerCase();
        if (normalized.includes('auto'))
            return 'Automatico';
        if (normalized.includes('manual'))
            return 'Manual';
        return this.nullableString(value, 40);
    }
};
exports.InventorySyncService = InventorySyncService;
exports.InventorySyncService = InventorySyncService = InventorySyncService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(shop_entity_1.ShopEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(vehicle_entity_1.VehicleEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(inventory_sync_log_entity_1.InventorySyncLogEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        schedule_1.SchedulerRegistry,
        qrcode_service_1.QrCodeService])
], InventorySyncService);
