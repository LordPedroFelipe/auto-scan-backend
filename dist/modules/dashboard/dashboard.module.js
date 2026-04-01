"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const chat_session_entity_1 = require("../chat/entities/chat-session.entity");
const chat_telemetry_event_entity_1 = require("../chat/entities/chat-telemetry-event.entity");
const inventory_sync_log_entity_1 = require("../inventory-sync/entities/inventory-sync-log.entity");
const lead_entity_1 = require("../leads/entities/lead.entity");
const shop_entity_1 = require("../shops/entities/shop.entity");
const sale_closure_entity_1 = require("../sales/entities/sale-closure.entity");
const test_drive_entity_1 = require("../test-drives/entities/test-drive.entity");
const user_entity_1 = require("../users/entities/user.entity");
const vehicle_entity_1 = require("../vehicles/entities/vehicle.entity");
const sales_goals_module_1 = require("../sales-goals/sales-goals.module");
const dashboard_controller_1 = require("./dashboard.controller");
const dashboard_service_1 = require("./dashboard.service");
let DashboardModule = class DashboardModule {
};
exports.DashboardModule = DashboardModule;
exports.DashboardModule = DashboardModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                shop_entity_1.ShopEntity,
                vehicle_entity_1.VehicleEntity,
                lead_entity_1.LeadEntity,
                sale_closure_entity_1.SaleClosureEntity,
                test_drive_entity_1.TestDriveEntity,
                user_entity_1.UserEntity,
                inventory_sync_log_entity_1.InventorySyncLogEntity,
                chat_session_entity_1.ChatSessionEntity,
                chat_telemetry_event_entity_1.ChatTelemetryEventEntity,
            ]),
            sales_goals_module_1.SalesGoalsModule,
        ],
        controllers: [dashboard_controller_1.DashboardController],
        providers: [dashboard_service_1.DashboardService],
    })
], DashboardModule);
