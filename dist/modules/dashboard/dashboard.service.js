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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const chat_session_entity_1 = require("../chat/entities/chat-session.entity");
const chat_telemetry_event_entity_1 = require("../chat/entities/chat-telemetry-event.entity");
const inventory_sync_log_entity_1 = require("../inventory-sync/entities/inventory-sync-log.entity");
const lead_entity_1 = require("../leads/entities/lead.entity");
const sale_closure_entity_1 = require("../sales/entities/sale-closure.entity");
const sales_goals_service_1 = require("../sales-goals/sales-goals.service");
const shop_entity_1 = require("../shops/entities/shop.entity");
const test_drive_entity_1 = require("../test-drives/entities/test-drive.entity");
const user_entity_1 = require("../users/entities/user.entity");
const vehicle_entity_1 = require("../vehicles/entities/vehicle.entity");
let DashboardService = class DashboardService {
    constructor(configService, dataSource, shopsRepository, vehiclesRepository, leadsRepository, saleClosuresRepository, testDrivesRepository, usersRepository, inventorySyncLogsRepository, chatSessionsRepository, chatTelemetryRepository, salesGoalsService) {
        this.configService = configService;
        this.dataSource = dataSource;
        this.shopsRepository = shopsRepository;
        this.vehiclesRepository = vehiclesRepository;
        this.leadsRepository = leadsRepository;
        this.saleClosuresRepository = saleClosuresRepository;
        this.testDrivesRepository = testDrivesRepository;
        this.usersRepository = usersRepository;
        this.inventorySyncLogsRepository = inventorySyncLogsRepository;
        this.chatSessionsRepository = chatSessionsRepository;
        this.chatTelemetryRepository = chatTelemetryRepository;
        this.salesGoalsService = salesGoalsService;
    }
    async getDashboardForUser(user, periodDaysRaw, sellerId, leadOrigin) {
        if (this.isSystemAdmin(user))
            return this.getSystemDashboard(user, periodDaysRaw);
        if (this.isShopAdmin(user))
            return this.getShopDashboard(user, periodDaysRaw, sellerId, leadOrigin);
        return this.getSellerDashboard(user, periodDaysRaw);
    }
    async getSystemDashboard(user, periodDaysRaw) {
        this.ensureSystemAdmin(user);
        const periodDays = this.resolvePeriodDays(periodDaysRaw);
        const now = new Date();
        const todayStart = this.startOfDay(now);
        const currentStart = this.daysAgo(periodDays - 1);
        const previousStart = this.daysAgo(periodDays * 2 - 1);
        const previousEnd = this.daysAgo(periodDays);
        const chartDays = this.resolveChartDays(periodDays);
        const chartStart = this.daysAgo(chartDays - 1);
        const syncAlertLimit = this.hoursAgo(12);
        const [totalShops, activeShops, totalVehicles, activeVehicles, totalLeads, previousLeads, totalTestDrives, previousTestDrives, sessions, previousSessions, telemetryCurrent, telemetryPrevious, totalSyncRuns, previousSyncRuns, successSyncCount, errorSyncCount, shopsWithoutOwner, shopsWithoutSync, staleSyncShops, errorSyncShops, shopsWithinSla, avgSyncDurationCurrent, avgSyncDurationPrevious, shopLeadRanking, shopTestDriveRanking, topShopsByStock, salesByShop, noSalesByShop, leadChart, testDriveChart, sessionChart, recentSyncLogs, latestSyncStatuses, slaByShop, leadsToday,] = await Promise.all([
            this.shopsRepository.count({ where: { isDeleted: false } }),
            this.shopsRepository.count({ where: { isDeleted: false, isActive: true } }),
            this.vehiclesRepository.count(),
            this.vehiclesRepository.count({ where: { isActive: true } }),
            this.leadsRepository.createQueryBuilder('lead').where('lead.createdAt >= :start', { start: currentStart }).getCount(),
            this.leadsRepository.createQueryBuilder('lead').where('lead.createdAt >= :start AND lead.createdAt < :end', { start: previousStart, end: previousEnd }).getCount(),
            this.testDrivesRepository.createQueryBuilder('testDrive').where('testDrive.createdAt >= :start', { start: currentStart }).getCount(),
            this.testDrivesRepository.createQueryBuilder('testDrive').where('testDrive.createdAt >= :start AND testDrive.createdAt < :end', { start: previousStart, end: previousEnd }).getCount(),
            this.chatSessionsRepository.createQueryBuilder('session').where('session.createdAt >= :start', { start: currentStart }).getCount(),
            this.chatSessionsRepository.createQueryBuilder('session').where('session.createdAt >= :start AND session.createdAt < :end', { start: previousStart, end: previousEnd }).getCount(),
            this.chatTelemetryRepository.createQueryBuilder('event').where('event.createdAt >= :start', { start: currentStart }).getCount(),
            this.chatTelemetryRepository.createQueryBuilder('event').where('event.createdAt >= :start AND event.createdAt < :end', { start: previousStart, end: previousEnd }).getCount(),
            this.inventorySyncLogsRepository.createQueryBuilder('log').where('log.startedAt >= :start', { start: currentStart }).getCount(),
            this.inventorySyncLogsRepository.createQueryBuilder('log').where('log.startedAt >= :start AND log.startedAt < :end', { start: previousStart, end: previousEnd }).getCount(),
            this.inventorySyncLogsRepository.count({ where: { status: 'success' } }),
            this.inventorySyncLogsRepository.count({ where: { status: 'error' } }),
            this.shopsRepository.count({ where: { isDeleted: false, ownerId: (0, typeorm_2.IsNull)() } }),
            this.shopsRepository.count({ where: { isDeleted: false, inventorySyncEnabled: false } }),
            this.shopsRepository.count({ where: { isDeleted: false, inventorySyncEnabled: true, inventoryLastSyncAt: (0, typeorm_2.LessThan)(syncAlertLimit) } }),
            this.shopsRepository.count({ where: { isDeleted: false, inventoryLastSyncStatus: 'error' } }),
            this.shopsRepository.count({ where: { isDeleted: false, inventorySyncEnabled: true, inventoryLastSyncAt: (0, typeorm_2.MoreThanOrEqual)(syncAlertLimit), inventoryLastSyncStatus: 'success' } }),
            this.averageSyncDuration(currentStart),
            this.averageSyncDuration(previousStart, previousEnd),
            this.aggregateShopsByMetric('lead', currentStart),
            this.aggregateShopsByMetric('testDrive', currentStart),
            this.aggregateShopsByStock(),
            this.aggregateSalesByShop(currentStart, sale_closure_entity_1.SaleOutcomeType.Sale),
            this.aggregateSalesByShop(currentStart, sale_closure_entity_1.SaleOutcomeType.NoSale),
            this.countByDay(this.leadsRepository, 'lead', 'createdAt', chartStart),
            this.countByDay(this.testDrivesRepository, 'testDrive', 'createdAt', chartStart),
            this.countByDay(this.chatSessionsRepository, 'session', 'createdAt', chartStart),
            this.inventorySyncLogsRepository.find({ order: { startedAt: 'DESC' }, take: 8 }),
            this.fetchLatestSyncStatuses(),
            this.buildSystemSlaByShop(syncAlertLimit),
            this.leadsRepository.createQueryBuilder('lead').where('lead.createdAt >= :todayStart', { todayStart }).getCount(),
        ]);
        const syncEnabledShops = Math.max(totalShops - shopsWithoutSync, 0);
        const slaCompliance = syncEnabledShops > 0 ? Math.round((shopsWithinSla / syncEnabledShops) * 100) : 0;
        const previousSlaCompliance = syncEnabledShops > 0
            ? Math.round(((syncEnabledShops - staleSyncShops - errorSyncShops) / syncEnabledShops) * 100)
            : 0;
        const conversion = totalLeads > 0 ? Math.round((totalTestDrives / totalLeads) * 100) : 0;
        const alerts = [
            shopsWithoutOwner > 0 ? this.buildAlert('Governanca', `${shopsWithoutOwner} loja(s) sem responsavel definido.`, 'warning') : null,
            shopsWithoutSync > 0 ? this.buildAlert('Integracao', `${shopsWithoutSync} loja(s) ainda sem sincronizacao automatica.`, 'warning') : null,
            staleSyncShops > 0 ? this.buildAlert('SLA', `${staleSyncShops} loja(s) estao fora do SLA de sincronizacao.`, 'error') : null,
            errorSyncShops > 0 ? this.buildAlert('Integracao', `${errorSyncShops} loja(s) com erro na ultima sincronizacao.`, 'error') : null,
        ].filter(Boolean);
        return {
            role: 'system-admin',
            generatedAt: now.toISOString(),
            meta: this.buildMeta(periodDays),
            hero: {
                eyebrow: 'Controle global',
                title: 'Operacao da plataforma',
                description: 'Visao executiva de governanca, saude, integracoes e escala da operacao multi-loja.',
            },
            kpis: [
                this.buildKpi('Lojas ativas', activeShops, `${totalShops} cadastradas`, null, 'ocean'),
                this.buildKpi('Veiculos ativos', activeVehicles, `${totalVehicles} no total`, null, 'forest'),
                this.buildKpi(`Leads ${periodDays} dias`, totalLeads, 'comparado ao periodo anterior', this.calculateTrend(totalLeads, previousLeads), 'amber'),
                this.buildKpi(`Test drives ${periodDays} dias`, totalTestDrives, `${conversion}% de conversao lead -> test drive`, this.calculateTrend(totalTestDrives, previousTestDrives), 'plum'),
                this.buildKpi(`Sessoes IA ${periodDays} dias`, sessions, `${telemetryCurrent} eventos de telemetria`, this.calculateTrend(sessions, previousSessions), 'slate'),
                this.buildKpi('SLA de integracao', slaCompliance, `${shopsWithinSla} loja(s) dentro do SLA`, this.calculateTrend(slaCompliance, previousSlaCompliance), slaCompliance >= 85 ? 'forest' : 'danger', '%'),
            ],
            shortcuts: [
                { label: 'Lojas', route: '/loja-lista', icon: 'storefront' },
                { label: 'Integracoes', route: '/integracoes', icon: 'sync' },
                { label: 'Usuarios', route: '/usuarios-lista', icon: 'groups' },
                { label: 'Leads', route: '/lead-lista', icon: 'support_agent' },
            ],
            health: {
                aiEnabled: !!this.configService.get('OPENAI_API_KEY'),
                aiModel: this.configService.get('OPENAI_MODEL', 'gpt-5-mini'),
                databaseConnection: this.dataSource.isInitialized ? 'up' : 'down',
                uptimeMinutes: Math.round(process.uptime() / 60),
                memoryUsagePercent: this.resolveMemoryUsagePercent(),
            },
            comparisons: {
                currentPeriodLabel: `Ultimos ${periodDays} dias`,
                previousPeriodLabel: `${periodDays} dias anteriores`,
                leads: { current: totalLeads, previous: previousLeads },
                testDrives: { current: totalTestDrives, previous: previousTestDrives },
                sessions: { current: sessions, previous: previousSessions },
                syncRuns: { current: totalSyncRuns, previous: previousSyncRuns },
                telemetry: { current: telemetryCurrent, previous: telemetryPrevious },
            },
            sla: {
                targetHours: 12,
                cards: [
                    { label: 'Dentro do SLA', value: shopsWithinSla, tone: 'forest' },
                    { label: 'Fora do SLA', value: staleSyncShops, tone: staleSyncShops > 0 ? 'danger' : 'slate' },
                    { label: 'Com erro', value: errorSyncShops, tone: errorSyncShops > 0 ? 'danger' : 'slate' },
                    { label: 'Sync desativada', value: shopsWithoutSync, tone: shopsWithoutSync > 0 ? 'amber' : 'slate' },
                ],
                averageDurationMs: avgSyncDurationCurrent,
                averageDurationTrend: this.calculateTrend(avgSyncDurationCurrent, avgSyncDurationPrevious),
            },
            charts: {
                leadsByDay: this.fillSeries(leadChart, chartStart, chartDays),
                testDrivesByDay: this.fillSeries(testDriveChart, chartStart, chartDays),
                sessionsByDay: this.fillSeries(sessionChart, chartStart, chartDays),
                syncStatus: [
                    { label: 'Sucesso', value: successSyncCount },
                    { label: 'Erro', value: errorSyncCount },
                ],
            },
            rankings: {
                topShopsByLeads: shopLeadRanking,
                topShopsByTestDrives: shopTestDriveRanking,
                topShopsByStock,
                salesByShop,
                noSalesByShop,
            },
            alerts,
            integrations: {
                recentRuns: recentSyncLogs.map((item) => ({
                    id: item.id,
                    shopId: item.shopId,
                    shopName: item.shopName,
                    status: item.status,
                    triggerType: item.triggerType,
                    startedAt: item.startedAt.toISOString(),
                    durationMs: item.durationMs,
                    imported: item.imported,
                    errorMessage: item.errorMessage,
                })),
                latestByShop: latestSyncStatuses,
                slaByShop,
            },
            summary: {
                leadsToday,
                pendingAttentionShops: staleSyncShops + errorSyncShops,
            },
        };
    }
    async getShopDashboard(user, periodDaysRaw, sellerId, leadOrigin) {
        this.ensureShopAdmin(user);
        const shopId = user.shopId;
        const selectedSellerId = sellerId || undefined;
        const selectedLeadOrigin = leadOrigin?.trim() || undefined;
        const periodDays = this.resolvePeriodDays(periodDaysRaw);
        const now = new Date();
        const todayStart = this.startOfDay(now);
        const currentStart = this.daysAgo(periodDays - 1);
        const previousStart = this.daysAgo(periodDays * 2 - 1);
        const previousEnd = this.daysAgo(periodDays);
        const chartDays = this.resolveChartDays(periodDays);
        const chartStart = this.daysAgo(chartDays - 1);
        const staleInventoryDate = this.daysAgo(45);
        const [shop, leadsToday, leadsCurrent, leadsPrevious, leadsWithoutContact, activeStock, stockWithoutPhoto, stockWithoutPrice, staleStock, testDrivesPending, testDrivesCurrent, testDrivesPrevious, sessionsCurrent, sessionsPrevious, leadChart, testDriveChart, leadStatusRows, leadFunnelCounts, leadsBySeller, sellerRanking, salesBySeller, salesByDay, noSaleReasons, paymentMethods, stockByBrand, recentLeads, upcomingTestDrives, integrationStatus, topDemandKeywords, overdueFollowUps, followUpsDueToday, wonLeadsCurrent, wonLeadsPrevious, leadOrigins, outcomeSummary, salesGoals,] = await Promise.all([
            this.shopsRepository.findOne({ where: { id: shopId } }),
            this.countLeadsWithFilters(shopId, todayStart, undefined, selectedSellerId, selectedLeadOrigin),
            this.countLeadsWithFilters(shopId, currentStart, undefined, selectedSellerId, selectedLeadOrigin),
            this.countLeadsWithFilters(shopId, previousStart, previousEnd, selectedSellerId, selectedLeadOrigin),
            this.countLeadsWithoutContact(shopId, selectedSellerId, selectedLeadOrigin),
            this.vehiclesRepository.count({ where: { shopId, isActive: true } }),
            this.vehiclesRepository.createQueryBuilder('vehicle').where('vehicle.shopId = :shopId AND vehicle.isActive = true', { shopId }).andWhere('COALESCE(array_length(vehicle.originalPhotoUrls, 1), 0) = 0').getCount(),
            this.vehiclesRepository.createQueryBuilder('vehicle').where('vehicle.shopId = :shopId AND vehicle.isActive = true', { shopId }).andWhere('vehicle.price <= 0').getCount(),
            this.vehiclesRepository.createQueryBuilder('vehicle').where('vehicle.shopId = :shopId AND vehicle.isActive = true', { shopId }).andWhere('COALESCE(vehicle.sourceUpdatedAt, vehicle.updatedAt) < :staleInventoryDate', { staleInventoryDate }).getCount(),
            this.testDrivesRepository.count({ where: { shopId, status: test_drive_entity_1.TestDriveStatus.Pending } }),
            this.testDrivesRepository.createQueryBuilder('testDrive').where('testDrive.shopId = :shopId AND testDrive.createdAt >= :start', { shopId, start: currentStart }).getCount(),
            this.testDrivesRepository.createQueryBuilder('testDrive').where('testDrive.shopId = :shopId AND testDrive.createdAt >= :start AND testDrive.createdAt < :end', { shopId, start: previousStart, end: previousEnd }).getCount(),
            this.chatSessionsRepository.createQueryBuilder('session').where('session.shopId = :shopId AND session.createdAt >= :start', { shopId, start: currentStart }).getCount(),
            this.chatSessionsRepository.createQueryBuilder('session').where('session.shopId = :shopId AND session.createdAt >= :start AND session.createdAt < :end', { shopId, start: previousStart, end: previousEnd }).getCount(),
            this.countLeadsByDay(shopId, chartStart, selectedSellerId, selectedLeadOrigin),
            this.countByDay(this.testDrivesRepository, 'testDrive', 'createdAt', chartStart, 'testDrive.shopId = :shopId', { shopId }),
            this.aggregateLeadStatus(shopId, selectedSellerId, selectedLeadOrigin),
            this.getLeadFunnel(shopId, selectedSellerId, selectedLeadOrigin),
            this.aggregateLeadsBySeller(shopId, currentStart, selectedLeadOrigin),
            this.aggregateSellerPerformance(shopId, currentStart, selectedLeadOrigin),
            this.aggregateSalesBySeller(shopId, currentStart, selectedSellerId, selectedLeadOrigin),
            this.aggregateSalesByDay(shopId, chartStart, selectedSellerId, selectedLeadOrigin),
            this.aggregateNoSaleReasons(shopId, currentStart, selectedSellerId, selectedLeadOrigin),
            this.aggregatePaymentMethods(shopId, currentStart, selectedSellerId, selectedLeadOrigin),
            this.aggregateStockByBrand(shopId),
            this.findRecentLeads(shopId, selectedSellerId, selectedLeadOrigin),
            this.testDrivesRepository.find({ where: { shopId }, relations: { vehicle: true, lead: true }, order: { preferredDate: 'ASC' }, take: 6 }),
            this.inventorySyncLogsRepository.findOne({ where: { shopId }, order: { startedAt: 'DESC' } }),
            this.aggregateShopKeywords(shopId),
            this.countOverdueFollowUpsByShop(shopId, selectedSellerId, selectedLeadOrigin),
            this.countFollowUpsDueTodayByShop(shopId, selectedSellerId, selectedLeadOrigin),
            this.countLeadsWithFilters(shopId, currentStart, undefined, selectedSellerId, selectedLeadOrigin, lead_entity_1.LeadStatus.Won),
            this.countLeadsWithFilters(shopId, previousStart, previousEnd, selectedSellerId, selectedLeadOrigin, lead_entity_1.LeadStatus.Won),
            this.listLeadOrigins(shopId),
            this.aggregateSaleOutcomeSummary(shopId, currentStart, undefined, selectedSellerId, selectedLeadOrigin),
            this.salesGoalsService.getGoalsWithProgress(shopId),
        ]);
        const alerts = [
            leadsWithoutContact > 0 ? this.buildAlert('Leads', `${leadsWithoutContact} lead(s) ainda sem primeiro contato.`, 'warning') : null,
            overdueFollowUps > 0 ? this.buildAlert('Follow-up', `${overdueFollowUps} follow-up(s) estao vencidos.`, 'error') : null,
            stockWithoutPhoto > 0 ? this.buildAlert('Estoque', `${stockWithoutPhoto} veiculo(s) ativos sem foto.`, 'warning') : null,
            stockWithoutPrice > 0 ? this.buildAlert('Estoque', `${stockWithoutPrice} veiculo(s) ativos sem preco valido.`, 'error') : null,
            staleStock > 0 ? this.buildAlert('Estoque', `${staleStock} veiculo(s) com estoque parado ha mais de 45 dias.`, 'warning') : null,
            integrationStatus?.status === 'error' ? this.buildAlert('Integracao', integrationStatus.errorMessage || 'A ultima sincronizacao da loja terminou com erro.', 'error') : null,
        ].filter(Boolean);
        const leadToTestDriveRate = leadsCurrent > 0 ? Math.round((testDrivesCurrent / leadsCurrent) * 100) : 0;
        const leadToSaleRate = leadsCurrent > 0 ? Math.round((outcomeSummary.sales / leadsCurrent) * 100) : 0;
        return {
            role: 'shop-admin',
            generatedAt: now.toISOString(),
            meta: this.buildMeta(periodDays),
            hero: {
                eyebrow: 'Operacao da loja',
                title: shop?.name ?? user.shopName ?? 'Minha loja',
                description: 'Visao comercial e operacional da loja, com foco em leads, estoque, equipe e proximas acoes.',
            },
            filters: {
                periodDays,
                availablePeriods: [7, 30, 90],
                selectedSellerId: selectedSellerId ?? null,
                selectedLeadOrigin: selectedLeadOrigin ?? null,
                leadOrigins,
            },
            kpis: [
                this.buildKpi('Leads hoje', leadsToday, 'entradas no dia atual', null, 'ocean'),
                this.buildKpi('Leads sem contato', leadsWithoutContact, 'pedem acao imediata', null, leadsWithoutContact > 0 ? 'danger' : 'forest'),
                this.buildKpi('Follow-ups vencidos', overdueFollowUps, `${followUpsDueToday} previstos para hoje`, null, overdueFollowUps > 0 ? 'danger' : 'slate'),
                this.buildKpi('Test drives pendentes', testDrivesPending, 'agendamentos aguardando confirmacao', null, 'plum'),
                this.buildKpi('Estoque ativo', activeStock, `${staleStock} parados ha mais de 45 dias`, null, 'forest'),
                this.buildKpi(`Leads ${periodDays} dias`, leadsCurrent, 'comparado ao periodo anterior', this.calculateTrend(leadsCurrent, leadsPrevious), 'amber'),
                this.buildKpi(`Sessoes IA ${periodDays} dias`, sessionsCurrent, 'engajamento do canal conversacional', this.calculateTrend(sessionsCurrent, sessionsPrevious), 'slate'),
                this.buildKpi('Conversao lead -> test drive', leadToTestDriveRate, `${testDrivesCurrent} test drives no periodo`, this.calculateTrend(testDrivesCurrent, testDrivesPrevious), 'plum', '%'),
            ],
            shortcuts: [
                { label: 'Estoque', route: '/estoque', icon: 'directions_car' },
                { label: 'Leads', route: '/lead-lista', icon: 'support_agent' },
                { label: 'Test drives', route: '/test-drive-list', icon: 'event_available' },
                { label: 'Perfil da loja', route: '/perfil', icon: 'store' },
            ],
            comparisons: {
                currentPeriodLabel: `Ultimos ${periodDays} dias`,
                previousPeriodLabel: `${periodDays} dias anteriores`,
                leads: { current: leadsCurrent, previous: leadsPrevious },
                testDrives: { current: testDrivesCurrent, previous: testDrivesPrevious },
                wonLeads: { current: wonLeadsCurrent, previous: wonLeadsPrevious },
                sessions: { current: sessionsCurrent, previous: sessionsPrevious },
            },
            charts: {
                leadsByDay: this.fillSeries(leadChart, chartStart, chartDays),
                testDrivesByDay: this.fillSeries(testDriveChart, chartStart, chartDays),
                salesByDay: this.fillSeries(salesByDay, chartStart, chartDays),
                leadStatusDistribution: leadStatusRows,
                leadsBySeller,
                stockByBrand,
                funnel: leadFunnelCounts,
                salesBySeller,
                noSaleReasons,
                paymentMethods,
            },
            sellerRanking,
            sales: {
                ...outcomeSummary,
                conversionRate: leadToSaleRate,
            },
            ai: {
                sessions30d: sessionsCurrent,
                topKeywords: topDemandKeywords,
            },
            alerts,
            pending: {
                recentLeads: recentLeads.map((lead) => ({
                    id: lead.id,
                    customerName: lead.name,
                    status: lead.status,
                    sellerName: lead.seller?.userName ?? null,
                    vehicleLabel: lead.vehicle ? `${lead.vehicle.brand} ${lead.vehicle.model}` : null,
                    createdAt: lead.createdAt.toISOString(),
                    hasBeenContacted: lead.hasBeenContacted,
                })),
                upcomingTestDrives: upcomingTestDrives.map((item) => ({
                    id: item.id,
                    customerName: item.customerName,
                    status: item.status,
                    vehicleLabel: item.vehicle ? `${item.vehicle.brand} ${item.vehicle.model}` : null,
                    preferredDate: item.preferredDate.toISOString(),
                    preferredTime: item.preferredTime,
                })),
            },
            salesGoals,
            inventory: { withoutPhoto: stockWithoutPhoto, withoutPrice: stockWithoutPrice, staleStock },
            integration: integrationStatus
                ? {
                    status: integrationStatus.status,
                    startedAt: integrationStatus.startedAt.toISOString(),
                    imported: integrationStatus.imported,
                    updated: integrationStatus.updated,
                    durationMs: integrationStatus.durationMs,
                    errorMessage: integrationStatus.errorMessage,
                }
                : null,
        };
    }
    async getSellerDashboard(user, periodDaysRaw) {
        this.ensureSellerScope(user);
        const sellerId = user.userId;
        const shopId = user.shopId;
        const periodDays = this.resolvePeriodDays(periodDaysRaw);
        const now = new Date();
        const todayStart = this.startOfDay(now);
        const currentStart = this.daysAgo(periodDays - 1);
        const previousStart = this.daysAgo(periodDays * 2 - 1);
        const previousEnd = this.daysAgo(periodDays);
        const chartDays = this.resolveChartDays(periodDays);
        const chartStart = this.daysAgo(chartDays - 1);
        const monthStart = this.startOfMonth(now);
        const [shop, myLeadsCurrent, myLeadsPrevious, myNewLeads, myLeadsWithoutContact, myWonLeadsCurrent, myWonLeadsPrevious, myTestDrivesUpcoming, myTestDrivesCurrent, myTestDrivesPrevious, recentAssignedLeads, myUpcomingTestDrives, leadsByDay, leadStatusRows, overdueTasks, followUpsDueToday, monthlyLeads, monthlyWonLeads, monthlyTestDrives, monthlyContacted, sellerGoals,] = await Promise.all([
            this.shopsRepository.findOne({ where: { id: shopId } }),
            this.leadsRepository.count({ where: { sellerId, createdAt: (0, typeorm_2.MoreThanOrEqual)(currentStart) } }),
            this.leadsRepository.createQueryBuilder('lead').where('lead.sellerId = :sellerId AND lead.createdAt >= :start AND lead.createdAt < :end', { sellerId, start: previousStart, end: previousEnd }).getCount(),
            this.leadsRepository.count({ where: { sellerId, createdAt: (0, typeorm_2.MoreThanOrEqual)(todayStart) } }),
            this.leadsRepository.count({ where: { sellerId, hasBeenContacted: false, isActive: true } }),
            this.leadsRepository.count({ where: { sellerId, status: lead_entity_1.LeadStatus.Won, createdAt: (0, typeorm_2.MoreThanOrEqual)(currentStart) } }),
            this.leadsRepository.createQueryBuilder('lead').where('lead.sellerId = :sellerId AND lead.status = :status AND lead.createdAt >= :start AND lead.createdAt < :end', { sellerId, status: lead_entity_1.LeadStatus.Won, start: previousStart, end: previousEnd }).getCount(),
            this.testDrivesRepository.createQueryBuilder('testDrive').leftJoin('testDrive.lead', 'lead').where('testDrive.shopId = :shopId', { shopId }).andWhere('lead.sellerId = :sellerId', { sellerId }).andWhere('testDrive.preferredDate >= :now', { now }).getCount(),
            this.testDrivesRepository.createQueryBuilder('testDrive').leftJoin('testDrive.lead', 'lead').where('testDrive.shopId = :shopId', { shopId }).andWhere('lead.sellerId = :sellerId', { sellerId }).andWhere('testDrive.createdAt >= :start', { start: currentStart }).getCount(),
            this.testDrivesRepository.createQueryBuilder('testDrive').leftJoin('testDrive.lead', 'lead').where('testDrive.shopId = :shopId', { shopId }).andWhere('lead.sellerId = :sellerId', { sellerId }).andWhere('testDrive.createdAt >= :start AND testDrive.createdAt < :end', { start: previousStart, end: previousEnd }).getCount(),
            this.leadsRepository.find({ where: { sellerId }, relations: { vehicle: true }, order: { createdAt: 'DESC' }, take: 6 }),
            this.testDrivesRepository.createQueryBuilder('testDrive').leftJoinAndSelect('testDrive.vehicle', 'vehicle').leftJoinAndSelect('testDrive.lead', 'lead').where('testDrive.shopId = :shopId', { shopId }).andWhere('lead.sellerId = :sellerId', { sellerId }).orderBy('testDrive.preferredDate', 'ASC').limit(6).getMany(),
            this.countByDay(this.leadsRepository, 'lead', 'createdAt', chartStart, 'lead.sellerId = :sellerId', { sellerId }),
            this.aggregateLeadStatus(shopId, sellerId),
            this.countOverdueFollowUpsBySeller(sellerId),
            this.countFollowUpsDueTodayBySeller(sellerId),
            this.leadsRepository.count({ where: { sellerId, createdAt: (0, typeorm_2.MoreThanOrEqual)(monthStart) } }),
            this.leadsRepository.count({ where: { sellerId, status: lead_entity_1.LeadStatus.Won, createdAt: (0, typeorm_2.MoreThanOrEqual)(monthStart) } }),
            this.testDrivesRepository.createQueryBuilder('testDrive').leftJoin('testDrive.lead', 'lead').where('lead.sellerId = :sellerId', { sellerId }).andWhere('testDrive.createdAt >= :start', { start: monthStart }).getCount(),
            this.leadsRepository.count({ where: { sellerId, hasBeenContacted: true, createdAt: (0, typeorm_2.MoreThanOrEqual)(monthStart) } }),
            this.salesGoalsService.getSellerGoals(sellerId),
        ]);
        const goals = this.resolveSellerGoals(shop?.settingsPreferences);
        const contactedRate = monthlyLeads > 0 ? Math.round((monthlyContacted / monthlyLeads) * 100) : 0;
        const alerts = [
            overdueTasks > 0 ? this.buildAlert('Follow-up', `${overdueTasks} tarefa(s) vencida(s) na sua fila.`, 'error') : null,
            myLeadsWithoutContact > 0 ? this.buildAlert('Leads', `${myLeadsWithoutContact} lead(s) sem primeiro contato.`, 'warning') : null,
            myTestDrivesUpcoming > 0 ? this.buildAlert('Agenda', `${myTestDrivesUpcoming} test drive(s) futuro(s) aguardando acompanhamento.`, 'info') : null,
        ].filter(Boolean);
        return {
            role: 'seller',
            generatedAt: now.toISOString(),
            meta: this.buildMeta(periodDays),
            hero: {
                eyebrow: 'Minha operacao',
                title: 'Painel do vendedor',
                description: 'Visao objetiva dos seus leads, follow-ups, metas do mes e agenda comercial.',
            },
            kpis: [
                this.buildKpi('Leads hoje', myNewLeads, 'novas entradas sob sua responsabilidade', null, 'ocean'),
                this.buildKpi(`Leads ${periodDays} dias`, myLeadsCurrent, 'volume pessoal recente', this.calculateTrend(myLeadsCurrent, myLeadsPrevious), 'amber'),
                this.buildKpi('Sem contato', myLeadsWithoutContact, 'pedem retorno agora', null, myLeadsWithoutContact > 0 ? 'danger' : 'forest'),
                this.buildKpi('Follow-ups vencidos', overdueTasks, `${followUpsDueToday} previsto(s) para hoje`, null, overdueTasks > 0 ? 'danger' : 'slate'),
                this.buildKpi('Test drives futuros', myTestDrivesUpcoming, 'agenda a acompanhar', null, 'plum'),
                this.buildKpi(`Ganhos ${periodDays} dias`, myWonLeadsCurrent, 'conversoes registradas', this.calculateTrend(myWonLeadsCurrent, myWonLeadsPrevious), 'forest'),
            ],
            shortcuts: [
                { label: 'Meus leads', route: '/lead-lista', icon: 'support_agent' },
                { label: 'Test drives', route: '/test-drive-list', icon: 'event_available' },
                { label: 'Estoque', route: '/estoque', icon: 'directions_car' },
                { label: 'Perfil', route: '/perfil', icon: 'badge' },
            ],
            alerts,
            comparisons: {
                currentPeriodLabel: `Ultimos ${periodDays} dias`,
                previousPeriodLabel: `${periodDays} dias anteriores`,
                leads: { current: myLeadsCurrent, previous: myLeadsPrevious },
                testDrives: { current: myTestDrivesCurrent, previous: myTestDrivesPrevious },
                wonLeads: { current: myWonLeadsCurrent, previous: myWonLeadsPrevious },
            },
            charts: {
                leadsByDay: this.fillSeries(leadsByDay, chartStart, chartDays),
                leadStatusDistribution: leadStatusRows,
            },
            salesGoals: sellerGoals,
            tasks: {
                myLeadsWithoutContact,
                upcomingTestDrives: myTestDrivesUpcoming,
                overdueFollowUps: overdueTasks,
                followUpsDueToday,
                recentAssignedLeads: recentAssignedLeads.map((lead) => ({
                    id: lead.id,
                    customerName: lead.name,
                    status: lead.status,
                    vehicleLabel: lead.vehicle ? `${lead.vehicle.brand} ${lead.vehicle.model}` : null,
                    createdAt: lead.createdAt.toISOString(),
                    hasBeenContacted: lead.hasBeenContacted,
                })),
                myUpcomingTestDrives: myUpcomingTestDrives.map((item) => ({
                    id: item.id,
                    customerName: item.customerName,
                    status: item.status,
                    vehicleLabel: item.vehicle ? `${item.vehicle.brand} ${item.vehicle.model}` : null,
                    preferredDate: item.preferredDate.toISOString(),
                    preferredTime: item.preferredTime,
                })),
            },
            goals: {
                monthLabel: this.formatMonthYear(now),
                cards: [
                    this.buildGoalCard('Meta de leads', monthlyLeads, goals.leadsTarget),
                    this.buildGoalCard('Meta de test drives', monthlyTestDrives, goals.testDrivesTarget),
                    this.buildGoalCard('Meta de ganhos', monthlyWonLeads, goals.wonLeadsTarget),
                    this.buildGoalCard('Meta de contato', contactedRate, goals.contactedRateTarget, '%'),
                ],
            },
        };
    }
    async aggregateShopsByMetric(metric, start) {
        const repository = metric === 'lead' ? this.leadsRepository : this.testDrivesRepository;
        const alias = metric === 'lead' ? 'lead' : 'testDrive';
        const qb = repository.createQueryBuilder(alias)
            .leftJoin(`${alias}.shop`, 'shop')
            .select(`${alias}.shopId`, 'shopId')
            .addSelect(`COALESCE(shop.name, 'Sem loja')`, 'shopName')
            .addSelect('COUNT(*)::int', 'value');
        if (start) {
            qb.where(`${alias}.createdAt >= :start`, { start });
        }
        const rows = await qb
            .groupBy(`${alias}.shopId`)
            .addGroupBy('shop.name')
            .orderBy('value', 'DESC')
            .limit(6)
            .getRawMany();
        return rows.map((row) => ({ shopId: row.shopId, shopName: row.shopName, value: Number(row.value) }));
    }
    async aggregateShopsByStock() {
        const rows = await this.vehiclesRepository.createQueryBuilder('vehicle')
            .leftJoin('vehicle.shop', 'shop')
            .select('vehicle.shopId', 'shopId')
            .addSelect(`COALESCE(shop.name, 'Sem loja')`, 'shopName')
            .addSelect('COUNT(*)::int', 'value')
            .where('vehicle.isActive = true')
            .groupBy('vehicle.shopId')
            .addGroupBy('shop.name')
            .orderBy('value', 'DESC')
            .limit(6)
            .getRawMany();
        return rows.map((row) => ({ shopId: row.shopId, shopName: row.shopName, value: Number(row.value) }));
    }
    async aggregateSalesByShop(start, outcomeType) {
        const rows = await this.saleClosuresRepository.createQueryBuilder('sale')
            .leftJoin('sale.shop', 'shop')
            .select('sale.shopId', 'shopId')
            .addSelect(`COALESCE(shop.name, 'Sem loja')`, 'shopName')
            .addSelect('COUNT(*)::int', 'value')
            .where('sale.closedAt >= :start', { start })
            .andWhere('sale.outcomeType = :outcomeType', { outcomeType })
            .groupBy('sale.shopId')
            .addGroupBy('shop.name')
            .orderBy('value', 'DESC')
            .limit(6)
            .getRawMany();
        return rows.map((row) => ({ shopId: row.shopId, shopName: row.shopName, value: Number(row.value) }));
    }
    async aggregateLeadStatus(shopId, sellerId, leadOrigin) {
        const qb = this.leadsRepository.createQueryBuilder('lead')
            .select('lead.status', 'label')
            .addSelect('COUNT(*)::int', 'value')
            .where('lead.shopId = :shopId', { shopId });
        if (sellerId) {
            qb.andWhere('lead.sellerId = :sellerId', { sellerId });
        }
        if (leadOrigin) {
            qb.andWhere('lead.origin = :leadOrigin', { leadOrigin });
        }
        const rows = await qb.groupBy('lead.status').orderBy('value', 'DESC').getRawMany();
        return rows.map((row) => ({ label: row.label, value: Number(row.value) }));
    }
    async aggregateLeadsBySeller(shopId, start, leadOrigin) {
        const qb = this.leadsRepository.createQueryBuilder('lead')
            .leftJoin('lead.seller', 'seller')
            .select(`COALESCE(seller.userName, 'Sem vendedor')`, 'label')
            .addSelect('COUNT(*)::int', 'value')
            .where('lead.shopId = :shopId', { shopId });
        if (start) {
            qb.andWhere('lead.createdAt >= :start', { start });
        }
        if (leadOrigin) {
            qb.andWhere('lead.origin = :leadOrigin', { leadOrigin });
        }
        const rows = await qb.groupBy('seller.userName').orderBy('value', 'DESC').limit(8).getRawMany();
        return rows.map((row) => ({ label: row.label, value: Number(row.value) }));
    }
    async aggregateSellerPerformance(shopId, start, leadOrigin) {
        const leadsRows = await this.leadsRepository.createQueryBuilder('lead')
            .leftJoin('lead.seller', 'seller')
            .select('lead.sellerId', 'sellerId')
            .addSelect(`COALESCE(seller.userName, 'Sem vendedor')`, 'sellerName')
            .addSelect('COUNT(*)::int', 'leads')
            .addSelect(`SUM(CASE WHEN lead.status = :wonStatus THEN 1 ELSE 0 END)::int`, 'wonLeads')
            .where('lead.shopId = :shopId', { shopId })
            .andWhere('lead.createdAt >= :start', { start })
            .setParameter('wonStatus', lead_entity_1.LeadStatus.Won)
            .groupBy('lead.sellerId')
            .addGroupBy('seller.userName')
            .orderBy('leads', 'DESC')
            .getRawMany();
        if (leadOrigin) {
            const filteredRows = await this.leadsRepository.createQueryBuilder('lead')
                .leftJoin('lead.seller', 'seller')
                .select('lead.sellerId', 'sellerId')
                .addSelect(`COALESCE(seller.userName, 'Sem vendedor')`, 'sellerName')
                .addSelect('COUNT(*)::int', 'leads')
                .addSelect(`SUM(CASE WHEN lead.status = :wonStatus THEN 1 ELSE 0 END)::int`, 'wonLeads')
                .where('lead.shopId = :shopId', { shopId })
                .andWhere('lead.createdAt >= :start', { start })
                .andWhere('lead.origin = :leadOrigin', { leadOrigin })
                .setParameter('wonStatus', lead_entity_1.LeadStatus.Won)
                .groupBy('lead.sellerId')
                .addGroupBy('seller.userName')
                .orderBy('leads', 'DESC')
                .getRawMany();
            leadsRows.splice(0, leadsRows.length, ...filteredRows);
        }
        const testDriveRows = await this.testDrivesRepository.createQueryBuilder('testDrive')
            .leftJoin('testDrive.lead', 'lead')
            .select('lead.sellerId', 'sellerId')
            .addSelect('COUNT(*)::int', 'testDrives')
            .where('testDrive.shopId = :shopId', { shopId })
            .andWhere('testDrive.createdAt >= :start', { start })
            .groupBy('lead.sellerId')
            .getRawMany();
        const testDriveMap = new Map(testDriveRows.map((row) => [row.sellerId ?? 'none', Number(row.testDrives)]));
        const salesRows = await this.aggregateSellerSalesMetrics(shopId, start, undefined, leadOrigin);
        const salesMap = new Map(salesRows.map((row) => [row.sellerId ?? 'none', row]));
        return leadsRows
            .map((row) => {
            const leads = Number(row.leads);
            const wonLeads = Number(row.wonLeads);
            const testDrives = testDriveMap.get(row.sellerId ?? 'none') ?? 0;
            const conversionRate = leads > 0 ? Math.round((wonLeads / leads) * 100) : 0;
            const salesMetrics = salesMap.get(row.sellerId ?? 'none');
            return {
                sellerId: row.sellerId,
                sellerName: row.sellerName,
                leads,
                testDrives,
                wonLeads,
                conversionRate,
                sales: salesMetrics?.sales ?? 0,
                noSales: salesMetrics?.noSales ?? 0,
                revenue: salesMetrics?.revenue ?? 0,
                averageTicket: salesMetrics?.averageTicket ?? 0,
            };
        })
            .sort((left, right) => right.conversionRate - left.conversionRate || right.leads - left.leads)
            .slice(0, 8);
    }
    async aggregateSalesBySeller(shopId, start, sellerId, leadOrigin) {
        const rows = await this.aggregateSellerSalesMetrics(shopId, start, sellerId, leadOrigin);
        return rows.map((row) => ({
            label: row.sellerName,
            sales: row.sales,
            noSales: row.noSales,
            value: row.sales,
        }));
    }
    async aggregateSellerSalesMetrics(shopId, start, sellerId, leadOrigin) {
        const qb = this.saleClosuresRepository.createQueryBuilder('sale')
            .leftJoin('sale.seller', 'seller')
            .leftJoin('sale.lead', 'lead')
            .select('sale.sellerId', 'sellerId')
            .addSelect(`COALESCE(seller.userName, 'Sem vendedor')`, 'sellerName')
            .addSelect(`SUM(CASE WHEN sale.outcomeType = :saleOutcome THEN 1 ELSE 0 END)::int`, 'sales')
            .addSelect(`SUM(CASE WHEN sale.outcomeType = :noSaleOutcome THEN 1 ELSE 0 END)::int`, 'noSales')
            .addSelect(`COALESCE(SUM(CASE WHEN sale.outcomeType = :saleOutcome THEN sale.salePrice ELSE 0 END), 0)`, 'revenue')
            .addSelect(`COALESCE(AVG(CASE WHEN sale.outcomeType = :saleOutcome THEN sale.salePrice END), 0)`, 'averageTicket')
            .where('sale.shopId = :shopId', { shopId })
            .andWhere('sale.closedAt >= :start', { start })
            .setParameters({ saleOutcome: sale_closure_entity_1.SaleOutcomeType.Sale, noSaleOutcome: sale_closure_entity_1.SaleOutcomeType.NoSale });
        if (sellerId)
            qb.andWhere('sale.sellerId = :sellerId', { sellerId });
        if (leadOrigin)
            qb.andWhere('lead.origin = :leadOrigin', { leadOrigin });
        const rows = await qb
            .groupBy('sale.sellerId')
            .addGroupBy('seller.userName')
            .orderBy('revenue', 'DESC')
            .getRawMany();
        return rows.map((row) => ({
            sellerId: row.sellerId,
            sellerName: row.sellerName,
            sales: Number(row.sales),
            noSales: Number(row.noSales),
            revenue: Number(row.revenue),
            averageTicket: Number(row.averageTicket),
        }));
    }
    async aggregateSalesByDay(shopId, start, sellerId, leadOrigin) {
        const qb = this.saleClosuresRepository.createQueryBuilder('sale')
            .leftJoin('sale.lead', 'lead')
            .select('DATE(sale.closedAt)', 'date')
            .addSelect(`SUM(CASE WHEN sale.outcomeType = :saleOutcome THEN 1 ELSE 0 END)::int`, 'value')
            .where('sale.shopId = :shopId', { shopId })
            .andWhere('sale.closedAt >= :start', { start })
            .setParameter('saleOutcome', sale_closure_entity_1.SaleOutcomeType.Sale);
        if (sellerId)
            qb.andWhere('sale.sellerId = :sellerId', { sellerId });
        if (leadOrigin)
            qb.andWhere('lead.origin = :leadOrigin', { leadOrigin });
        const rows = await qb.groupBy('DATE(sale.closedAt)').orderBy('DATE(sale.closedAt)', 'ASC').getRawMany();
        return rows.map((row) => ({ date: row.date, value: Number(row.value) }));
    }
    async aggregateNoSaleReasons(shopId, start, sellerId, leadOrigin) {
        const qb = this.saleClosuresRepository.createQueryBuilder('sale')
            .leftJoin('sale.lead', 'lead')
            .select(`
        CASE COALESCE(sale.noSaleReason, 'NotInformed')
          WHEN 'Price' THEN 'Preco'
          WHEN 'CreditDenied' THEN 'Credito negado'
          WHEN 'ChoseCompetitor' THEN 'Escolheu concorrente'
          WHEN 'NoContact' THEN 'Sem contato'
          WHEN 'StockUnavailable' THEN 'Estoque indisponivel'
          WHEN 'PostponedDecision' THEN 'Decisao adiada'
          WHEN 'VehicleMismatch' THEN 'Veiculo nao aderente'
          WHEN 'Other' THEN 'Outro'
          WHEN 'NotInformed' THEN 'Nao informado'
          ELSE 'Desconhecido'
        END
      `, 'label')
            .addSelect('COUNT(*)::int', 'value')
            .where('sale.shopId = :shopId', { shopId })
            .andWhere('sale.closedAt >= :start', { start })
            .andWhere('sale.outcomeType = :outcomeType', { outcomeType: sale_closure_entity_1.SaleOutcomeType.NoSale });
        if (sellerId)
            qb.andWhere('sale.sellerId = :sellerId', { sellerId });
        if (leadOrigin)
            qb.andWhere('lead.origin = :leadOrigin', { leadOrigin });
        const rows = await qb.groupBy(`
        CASE COALESCE(sale.noSaleReason, 'NotInformed')
          WHEN 'Price' THEN 'Preco'
          WHEN 'CreditDenied' THEN 'Credito negado'
          WHEN 'ChoseCompetitor' THEN 'Escolheu concorrente'
          WHEN 'NoContact' THEN 'Sem contato'
          WHEN 'StockUnavailable' THEN 'Estoque indisponivel'
          WHEN 'PostponedDecision' THEN 'Decisao adiada'
          WHEN 'VehicleMismatch' THEN 'Veiculo nao aderente'
          WHEN 'Other' THEN 'Outro'
          WHEN 'NotInformed' THEN 'Nao informado'
          ELSE 'Desconhecido'
        END
      `).orderBy('value', 'DESC').limit(8).getRawMany();
        return rows.map((row) => ({ label: row.label, value: Number(row.value) }));
    }
    async aggregatePaymentMethods(shopId, start, sellerId, leadOrigin) {
        const qb = this.saleClosuresRepository.createQueryBuilder('sale')
            .leftJoin('sale.lead', 'lead')
            .select(`COALESCE(sale.paymentMethod::text, 'Nao informado')`, 'label')
            .addSelect('COUNT(*)::int', 'value')
            .where('sale.shopId = :shopId', { shopId })
            .andWhere('sale.closedAt >= :start', { start })
            .andWhere('sale.outcomeType = :outcomeType', { outcomeType: sale_closure_entity_1.SaleOutcomeType.Sale });
        if (sellerId)
            qb.andWhere('sale.sellerId = :sellerId', { sellerId });
        if (leadOrigin)
            qb.andWhere('lead.origin = :leadOrigin', { leadOrigin });
        const rows = await qb.groupBy('sale.paymentMethod').orderBy('value', 'DESC').limit(8).getRawMany();
        return rows.map((row) => ({ label: row.label, value: Number(row.value) }));
    }
    async aggregateStockByBrand(shopId) {
        const rows = await this.vehiclesRepository.createQueryBuilder('vehicle')
            .select('vehicle.brand', 'label')
            .addSelect('COUNT(*)::int', 'value')
            .where('vehicle.shopId = :shopId AND vehicle.isActive = true', { shopId })
            .groupBy('vehicle.brand')
            .orderBy('value', 'DESC')
            .limit(8)
            .getRawMany();
        return rows.map((row) => ({ label: row.label, value: Number(row.value) }));
    }
    async aggregateShopKeywords(shopId) {
        const rows = await this.chatSessionsRepository.createQueryBuilder('session')
            .select('unnest(session.keywords)', 'label')
            .addSelect('COUNT(*)::int', 'value')
            .where('session.shopId = :shopId', { shopId })
            .groupBy('label')
            .orderBy('value', 'DESC')
            .limit(8)
            .getRawMany();
        return rows.map((row) => ({ label: row.label, value: Number(row.value) }));
    }
    async getLeadFunnel(shopId, sellerId, leadOrigin) {
        const [newCount, contactedCount, qualifiedCount, negotiatingCount, wonCount] = await Promise.all([
            this.countLeadsWithFilters(shopId, undefined, undefined, sellerId, leadOrigin, lead_entity_1.LeadStatus.New),
            this.countLeadsContacted(shopId, sellerId, leadOrigin),
            this.countLeadsWithFilters(shopId, undefined, undefined, sellerId, leadOrigin, lead_entity_1.LeadStatus.Qualified),
            this.countLeadsWithFilters(shopId, undefined, undefined, sellerId, leadOrigin, lead_entity_1.LeadStatus.Negotiating),
            this.countLeadsWithFilters(shopId, undefined, undefined, sellerId, leadOrigin, lead_entity_1.LeadStatus.Won),
        ]);
        return [
            { label: 'Novos leads', value: newCount },
            { label: 'Contatados', value: contactedCount },
            { label: 'Qualificados', value: qualifiedCount },
            { label: 'Em negociacao', value: negotiatingCount },
            { label: 'Ganhos', value: wonCount },
        ];
    }
    async fetchLatestSyncStatuses() {
        const rows = await this.inventorySyncLogsRepository.createQueryBuilder('log')
            .distinctOn(['log.shopId'])
            .orderBy('log.shopId', 'ASC')
            .addOrderBy('log.startedAt', 'DESC')
            .getMany();
        return rows.map((item) => ({
            shopId: item.shopId,
            shopName: item.shopName,
            status: item.status,
            startedAt: item.startedAt.toISOString(),
            errorMessage: item.errorMessage,
        }));
    }
    async buildSystemSlaByShop(syncAlertLimit) {
        const shops = await this.shopsRepository.find({
            where: { isDeleted: false },
            order: { name: 'ASC' },
        });
        return shops.map((shop) => {
            const hoursSinceLastSync = shop.inventoryLastSyncAt
                ? Math.max(Math.round((Date.now() - new Date(shop.inventoryLastSyncAt).getTime()) / 3600000), 0)
                : null;
            let slaStatus = 'ok';
            if (!shop.inventorySyncEnabled) {
                slaStatus = 'disabled';
            }
            else if (shop.inventoryLastSyncStatus === 'error') {
                slaStatus = 'error';
            }
            else if (!shop.inventoryLastSyncAt || shop.inventoryLastSyncAt < syncAlertLimit) {
                slaStatus = 'warning';
            }
            return {
                shopId: shop.id,
                shopName: shop.name,
                inventorySyncEnabled: shop.inventorySyncEnabled,
                lastSyncAt: shop.inventoryLastSyncAt?.toISOString() ?? null,
                lastSyncStatus: shop.inventoryLastSyncStatus ?? null,
                hoursSinceLastSync,
                slaStatus,
                lastSyncError: shop.inventoryLastSyncError ?? null,
            };
        });
    }
    async averageSyncDuration(start, end) {
        const qb = this.inventorySyncLogsRepository.createQueryBuilder('log')
            .select('COALESCE(AVG(log.durationMs), 0)', 'avg')
            .where('log.startedAt >= :start', { start });
        if (end) {
            qb.andWhere('log.startedAt < :end', { end });
        }
        const row = await qb.getRawOne();
        return Math.round(Number(row?.avg ?? 0));
    }
    async countOverdueFollowUpsByShop(shopId, sellerId, leadOrigin) {
        const qb = this.leadsRepository.createQueryBuilder('lead')
            .where('lead.shopId = :shopId', { shopId })
            .andWhere('lead.isActive = true')
            .andWhere(`(
        (lead.hasBeenContacted = false AND lead.createdAt < :firstContactLimit)
        OR
        (lead.hasBeenContacted = true AND lead.status IN (:...activeStatuses) AND COALESCE(lead.lastContactDate, lead.contactDate, lead.createdAt) < :followUpLimit)
      )`, {
            firstContactLimit: this.hoursAgo(24),
            activeStatuses: [lead_entity_1.LeadStatus.Contacted, lead_entity_1.LeadStatus.InProgress, lead_entity_1.LeadStatus.Qualified, lead_entity_1.LeadStatus.Negotiating],
            followUpLimit: this.daysAgo(3),
        });
        if (sellerId)
            qb.andWhere('lead.sellerId = :sellerId', { sellerId });
        if (leadOrigin)
            qb.andWhere('lead.origin = :leadOrigin', { leadOrigin });
        return qb.getCount();
    }
    async countFollowUpsDueTodayByShop(shopId, sellerId, leadOrigin) {
        const qb = this.leadsRepository.createQueryBuilder('lead')
            .where('lead.shopId = :shopId', { shopId })
            .andWhere('lead.isActive = true')
            .andWhere('lead.hasBeenContacted = true')
            .andWhere('lead.status IN (:...activeStatuses)', { activeStatuses: [lead_entity_1.LeadStatus.Contacted, lead_entity_1.LeadStatus.InProgress, lead_entity_1.LeadStatus.Qualified, lead_entity_1.LeadStatus.Negotiating] })
            .andWhere('COALESCE(lead.lastContactDate, lead.contactDate, lead.createdAt) >= :from', { from: this.daysAgo(3) });
        if (sellerId)
            qb.andWhere('lead.sellerId = :sellerId', { sellerId });
        if (leadOrigin)
            qb.andWhere('lead.origin = :leadOrigin', { leadOrigin });
        return qb.getCount();
    }
    async countOverdueFollowUpsBySeller(sellerId) {
        return this.leadsRepository.createQueryBuilder('lead')
            .where('lead.sellerId = :sellerId', { sellerId })
            .andWhere('lead.isActive = true')
            .andWhere(`(
        (lead.hasBeenContacted = false AND lead.createdAt < :firstContactLimit)
        OR
        (lead.hasBeenContacted = true AND lead.status IN (:...activeStatuses) AND COALESCE(lead.lastContactDate, lead.contactDate, lead.createdAt) < :followUpLimit)
      )`, {
            firstContactLimit: this.hoursAgo(24),
            activeStatuses: [lead_entity_1.LeadStatus.Contacted, lead_entity_1.LeadStatus.InProgress, lead_entity_1.LeadStatus.Qualified, lead_entity_1.LeadStatus.Negotiating],
            followUpLimit: this.daysAgo(3),
        })
            .getCount();
    }
    async countFollowUpsDueTodayBySeller(sellerId) {
        return this.leadsRepository.createQueryBuilder('lead')
            .where('lead.sellerId = :sellerId', { sellerId })
            .andWhere('lead.isActive = true')
            .andWhere('lead.hasBeenContacted = true')
            .andWhere('lead.status IN (:...activeStatuses)', { activeStatuses: [lead_entity_1.LeadStatus.Contacted, lead_entity_1.LeadStatus.InProgress, lead_entity_1.LeadStatus.Qualified, lead_entity_1.LeadStatus.Negotiating] })
            .andWhere('COALESCE(lead.lastContactDate, lead.contactDate, lead.createdAt) >= :from', { from: this.daysAgo(3) })
            .getCount();
    }
    async countLeadsWithFilters(shopId, start, end, sellerId, leadOrigin, status) {
        const qb = this.leadsRepository.createQueryBuilder('lead')
            .where('lead.shopId = :shopId', { shopId });
        if (start)
            qb.andWhere('lead.createdAt >= :start', { start });
        if (end)
            qb.andWhere('lead.createdAt < :end', { end });
        if (sellerId)
            qb.andWhere('lead.sellerId = :sellerId', { sellerId });
        if (leadOrigin)
            qb.andWhere('lead.origin = :leadOrigin', { leadOrigin });
        if (status)
            qb.andWhere('lead.status = :status', { status });
        return qb.getCount();
    }
    async countLeadsWithoutContact(shopId, sellerId, leadOrigin) {
        const qb = this.leadsRepository.createQueryBuilder('lead')
            .where('lead.shopId = :shopId', { shopId })
            .andWhere('lead.hasBeenContacted = false')
            .andWhere('lead.isActive = true');
        if (sellerId)
            qb.andWhere('lead.sellerId = :sellerId', { sellerId });
        if (leadOrigin)
            qb.andWhere('lead.origin = :leadOrigin', { leadOrigin });
        return qb.getCount();
    }
    async countLeadsContacted(shopId, sellerId, leadOrigin) {
        const qb = this.leadsRepository.createQueryBuilder('lead')
            .where('lead.shopId = :shopId', { shopId })
            .andWhere('lead.hasBeenContacted = true');
        if (sellerId)
            qb.andWhere('lead.sellerId = :sellerId', { sellerId });
        if (leadOrigin)
            qb.andWhere('lead.origin = :leadOrigin', { leadOrigin });
        return qb.getCount();
    }
    async countLeadsByDay(shopId, start, sellerId, leadOrigin) {
        const qb = this.leadsRepository.createQueryBuilder('lead')
            .select('DATE(lead.createdAt)', 'date')
            .addSelect('COUNT(*)::int', 'value')
            .where('lead.shopId = :shopId', { shopId })
            .andWhere('lead.createdAt >= :start', { start });
        if (sellerId)
            qb.andWhere('lead.sellerId = :sellerId', { sellerId });
        if (leadOrigin)
            qb.andWhere('lead.origin = :leadOrigin', { leadOrigin });
        const rows = await qb
            .groupBy('DATE(lead.createdAt)')
            .orderBy('DATE(lead.createdAt)', 'ASC')
            .getRawMany();
        return rows.map((row) => ({ date: row.date, value: Number(row.value) }));
    }
    async findRecentLeads(shopId, sellerId, leadOrigin) {
        const qb = this.leadsRepository.createQueryBuilder('lead')
            .leftJoinAndSelect('lead.seller', 'seller')
            .leftJoinAndSelect('lead.vehicle', 'vehicle')
            .where('lead.shopId = :shopId', { shopId })
            .orderBy('lead.createdAt', 'DESC')
            .limit(6);
        if (sellerId)
            qb.andWhere('lead.sellerId = :sellerId', { sellerId });
        if (leadOrigin)
            qb.andWhere('lead.origin = :leadOrigin', { leadOrigin });
        return qb.getMany();
    }
    async listLeadOrigins(shopId) {
        const rows = await this.leadsRepository.createQueryBuilder('lead')
            .select('lead.origin', 'origin')
            .where('lead.shopId = :shopId', { shopId })
            .andWhere('lead.origin IS NOT NULL')
            .groupBy('lead.origin')
            .orderBy('lead.origin', 'ASC')
            .getRawMany();
        return rows.map((row) => row.origin).filter(Boolean);
    }
    async aggregateSaleOutcomeSummary(shopId, start, end, sellerId, leadOrigin) {
        const qb = this.saleClosuresRepository.createQueryBuilder('sale')
            .leftJoin('sale.lead', 'lead')
            .select(`SUM(CASE WHEN sale.outcomeType = :saleOutcome THEN 1 ELSE 0 END)::int`, 'sales')
            .addSelect(`SUM(CASE WHEN sale.outcomeType = :noSaleOutcome THEN 1 ELSE 0 END)::int`, 'noSales')
            .addSelect(`COALESCE(SUM(CASE WHEN sale.outcomeType = :saleOutcome THEN sale.salePrice ELSE 0 END), 0)`, 'grossRevenue')
            .addSelect(`COALESCE(AVG(CASE WHEN sale.outcomeType = :saleOutcome THEN sale.salePrice END), 0)`, 'averageTicket')
            .addSelect(`COALESCE(AVG(CASE WHEN sale.outcomeType = :saleOutcome THEN sale.discountPercent END), 0)`, 'averageDiscount')
            .where('sale.shopId = :shopId', { shopId })
            .andWhere('sale.closedAt >= :start', { start })
            .setParameters({ saleOutcome: sale_closure_entity_1.SaleOutcomeType.Sale, noSaleOutcome: sale_closure_entity_1.SaleOutcomeType.NoSale });
        if (end)
            qb.andWhere('sale.closedAt < :end', { end });
        if (sellerId)
            qb.andWhere('sale.sellerId = :sellerId', { sellerId });
        if (leadOrigin)
            qb.andWhere('lead.origin = :leadOrigin', { leadOrigin });
        const row = await qb.getRawOne();
        return {
            sales: Number(row?.sales ?? 0),
            noSales: Number(row?.noSales ?? 0),
            grossRevenue: Number(row?.grossRevenue ?? 0),
            averageTicket: Number(row?.averageTicket ?? 0),
            averageDiscount: Number(row?.averageDiscount ?? 0),
        };
    }
    async countByDay(repository, alias, column, start, extraWhere, params) {
        const qb = repository.createQueryBuilder(alias)
            .select(`DATE(${alias}.${column})`, 'date')
            .addSelect('COUNT(*)::int', 'value')
            .where(`${alias}.${column} >= :start`, { start });
        if (extraWhere) {
            qb.andWhere(extraWhere, params ?? {});
        }
        const rows = await qb.groupBy(`DATE(${alias}.${column})`).orderBy(`DATE(${alias}.${column})`, 'ASC').getRawMany();
        return rows.map((row) => ({ date: row.date, value: Number(row.value) }));
    }
    fillSeries(items, start, days) {
        const lookup = new Map(items.map((item) => [item.date, item.value]));
        const series = [];
        for (let index = 0; index < days; index += 1) {
            const current = new Date(start);
            current.setDate(start.getDate() + index);
            const key = current.toISOString().slice(0, 10);
            series.push({ label: key, value: lookup.get(key) ?? 0 });
        }
        return series;
    }
    calculateTrend(current, previous) {
        if (previous <= 0) {
            return current > 0 ? { value: 100, direction: 'up' } : null;
        }
        const delta = Math.round(((current - previous) / previous) * 100);
        return { value: Math.abs(delta), direction: delta >= 0 ? 'up' : 'down' };
    }
    buildKpi(label, value, detail, trend, tone, suffix = '') {
        return { label, value: `${this.formatNumber(value)}${suffix}`, rawValue: value, detail, trend, tone };
    }
    buildAlert(title, message, severity) {
        return { title, message, severity };
    }
    buildGoalCard(label, current, target, suffix = '') {
        const progress = target > 0 ? Math.min(Math.round((current / target) * 100), 999) : 0;
        return {
            label,
            current,
            target,
            progress,
            currentLabel: `${this.formatNumber(current)}${suffix}`,
            targetLabel: `${this.formatNumber(target)}${suffix}`,
            tone: progress >= 100 ? 'forest' : progress >= 70 ? 'amber' : 'ocean',
        };
    }
    buildMeta(periodDays) {
        return {
            periodDays,
            availablePeriods: [7, 30, 90],
        };
    }
    resolveSellerGoals(settingsPreferences) {
        const dashboardGoals = settingsPreferences?.dashboardGoals ?? {};
        return {
            leadsTarget: Number(dashboardGoals.sellerLeadsTarget ?? 40),
            testDrivesTarget: Number(dashboardGoals.sellerTestDrivesTarget ?? 8),
            wonLeadsTarget: Number(dashboardGoals.sellerWonLeadsTarget ?? 4),
            contactedRateTarget: Number(dashboardGoals.sellerContactRateTarget ?? 90),
        };
    }
    resolvePeriodDays(periodDaysRaw) {
        const parsed = Number(periodDaysRaw);
        return [7, 30, 90].includes(parsed) ? parsed : 30;
    }
    resolveChartDays(periodDays) {
        if (periodDays === 90)
            return 21;
        if (periodDays === 30)
            return 14;
        return 7;
    }
    formatNumber(value) {
        return Number(value ?? 0).toLocaleString('pt-BR');
    }
    formatMonthYear(date) {
        return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    }
    resolveMemoryUsagePercent() {
        const memory = process.memoryUsage();
        return memory.heapTotal > 0 ? Math.round((memory.heapUsed / memory.heapTotal) * 100) : 0;
    }
    startOfDay(date) {
        const result = new Date(date);
        result.setHours(0, 0, 0, 0);
        return result;
    }
    startOfMonth(date) {
        const result = new Date(date);
        result.setDate(1);
        result.setHours(0, 0, 0, 0);
        return result;
    }
    daysAgo(days) {
        const result = new Date();
        result.setHours(0, 0, 0, 0);
        result.setDate(result.getDate() - days);
        return result;
    }
    hoursAgo(hours) {
        return new Date(Date.now() - hours * 60 * 60 * 1000);
    }
    isSystemAdmin(user) {
        return user.roles.includes('Admin');
    }
    isShopAdmin(user) {
        return !!user.shopId && user.roles.some((role) => ['ShopOwner', 'Admin'].includes(role));
    }
    ensureSystemAdmin(user) {
        if (!this.isSystemAdmin(user)) {
            throw new common_1.ForbiddenException('Acesso restrito ao admin do sistema.');
        }
    }
    ensureShopAdmin(user) {
        if (!this.isShopAdmin(user)) {
            throw new common_1.ForbiddenException('Acesso restrito ao admin da loja.');
        }
    }
    ensureSellerScope(user) {
        if (!user.shopId) {
            throw new common_1.ForbiddenException('Dashboard do vendedor exige loja vinculada.');
        }
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, typeorm_1.InjectRepository)(shop_entity_1.ShopEntity)),
    __param(3, (0, typeorm_1.InjectRepository)(vehicle_entity_1.VehicleEntity)),
    __param(4, (0, typeorm_1.InjectRepository)(lead_entity_1.LeadEntity)),
    __param(5, (0, typeorm_1.InjectRepository)(sale_closure_entity_1.SaleClosureEntity)),
    __param(6, (0, typeorm_1.InjectRepository)(test_drive_entity_1.TestDriveEntity)),
    __param(7, (0, typeorm_1.InjectRepository)(user_entity_1.UserEntity)),
    __param(8, (0, typeorm_1.InjectRepository)(inventory_sync_log_entity_1.InventorySyncLogEntity)),
    __param(9, (0, typeorm_1.InjectRepository)(chat_session_entity_1.ChatSessionEntity)),
    __param(10, (0, typeorm_1.InjectRepository)(chat_telemetry_event_entity_1.ChatTelemetryEventEntity)),
    __metadata("design:paramtypes", [config_1.ConfigService,
        typeorm_2.DataSource,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        sales_goals_service_1.SalesGoalsService])
], DashboardService);
