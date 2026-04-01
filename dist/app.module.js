"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const schedule_1 = require("@nestjs/schedule");
const typeorm_1 = require("@nestjs/typeorm");
const auth_module_1 = require("./modules/auth/auth.module");
const chat_module_1 = require("./modules/chat/chat.module");
const dashboard_module_1 = require("./modules/dashboard/dashboard.module");
const email_module_1 = require("./modules/email/email.module");
const inventory_sync_module_1 = require("./modules/inventory-sync/inventory-sync.module");
const lead_notes_module_1 = require("./modules/lead-notes/lead-notes.module");
const leads_module_1 = require("./modules/leads/leads.module");
const permissions_module_1 = require("./modules/permissions/permissions.module");
const qrcode_module_1 = require("./modules/qrcode/qrcode.module");
const reports_module_1 = require("./modules/reports/reports.module");
const settings_module_1 = require("./modules/settings/settings.module");
const sales_goals_module_1 = require("./modules/sales-goals/sales-goals.module");
const shops_module_1 = require("./modules/shops/shops.module");
const subscriptions_module_1 = require("./modules/subscriptions/subscriptions.module");
const test_drives_module_1 = require("./modules/test-drives/test-drives.module");
const users_module_1 = require("./modules/users/users.module");
const vehicles_module_1 = require("./modules/vehicles/vehicles.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            schedule_1.ScheduleModule.forRoot(),
            typeorm_1.TypeOrmModule.forRootAsync({
                inject: [config_1.ConfigService],
                useFactory: (configService) => ({
                    type: 'postgres',
                    host: configService.get('DB_HOST', 'localhost'),
                    port: Number(configService.get('DB_PORT', '5432')),
                    username: configService.get('DB_USERNAME', 'postgres'),
                    password: configService.get('DB_PASSWORD', 'postgres'),
                    database: configService.get('DB_DATABASE', 'auto_scan'),
                    autoLoadEntities: true,
                    synchronize: false,
                }),
            }),
            auth_module_1.AuthModule,
            chat_module_1.ChatModule,
            dashboard_module_1.DashboardModule,
            email_module_1.EmailModule,
            inventory_sync_module_1.InventorySyncModule,
            lead_notes_module_1.LeadNotesModule,
            permissions_module_1.PermissionsModule,
            qrcode_module_1.QrCodeModule,
            reports_module_1.ReportsModule,
            sales_goals_module_1.SalesGoalsModule,
            settings_module_1.SettingsModule,
            users_module_1.UsersModule,
            shops_module_1.ShopsModule,
            subscriptions_module_1.SubscriptionsModule,
            vehicles_module_1.VehiclesModule,
            leads_module_1.LeadsModule,
            test_drives_module_1.TestDrivesModule,
        ],
    })
], AppModule);
