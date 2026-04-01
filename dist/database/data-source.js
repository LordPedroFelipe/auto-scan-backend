"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
require("dotenv/config");
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const chat_message_entity_1 = require("../modules/chat/entities/chat-message.entity");
const chat_session_entity_1 = require("../modules/chat/entities/chat-session.entity");
const chat_telemetry_event_entity_1 = require("../modules/chat/entities/chat-telemetry-event.entity");
const lead_note_entity_1 = require("../modules/lead-notes/entities/lead-note.entity");
const lead_entity_1 = require("../modules/leads/entities/lead.entity");
const qr_code_entity_1 = require("../modules/qrcode/entities/qr-code.entity");
const shop_entity_1 = require("../modules/shops/entities/shop.entity");
const subscription_payment_entity_1 = require("../modules/subscriptions/entities/subscription-payment.entity");
const subscription_entity_1 = require("../modules/subscriptions/entities/subscription.entity");
const test_drive_entity_1 = require("../modules/test-drives/entities/test-drive.entity");
const user_entity_1 = require("../modules/users/entities/user.entity");
const vehicle_entity_1 = require("../modules/vehicles/entities/vehicle.entity");
const inventory_sync_log_entity_1 = require("../modules/inventory-sync/entities/inventory-sync-log.entity");
const sale_closure_entity_1 = require("../modules/sales/entities/sale-closure.entity");
const _1743300000000_KafkaBootstrap_1 = require("./migrations/1743300000000-KafkaBootstrap");
const _1743320000000_ChatAiUpgrade_1 = require("./migrations/1743320000000-ChatAiUpgrade");
const _1743311000000_VehiclePhotoVariants_1 = require("./migrations/1743311000000-VehiclePhotoVariants");
const _1743330000000_PlatformAdminBootstrap_1 = require("./migrations/1743330000000-PlatformAdminBootstrap");
const _1743340000000_ShopSettingsPreferences_1 = require("./migrations/1743340000000-ShopSettingsPreferences");
const _1743350000000_BillingProductionReadiness_1 = require("./migrations/1743350000000-BillingProductionReadiness");
const _1743360000000_SubscriptionCatalogBootstrap_1 = require("./migrations/1743360000000-SubscriptionCatalogBootstrap");
const _1743370000000_ShopInventoryIntegrationSettings_1 = require("./migrations/1743370000000-ShopInventoryIntegrationSettings");
const _1743380000000_InventorySyncLogs_1 = require("./migrations/1743380000000-InventorySyncLogs");
const _1743390000000_ShopInventoryRequestConfig_1 = require("./migrations/1743390000000-ShopInventoryRequestConfig");
const _1743400000000_SaleClosures_1 = require("./migrations/1743400000000-SaleClosures");
const _1743410000000_LeadOrigin_1 = require("./migrations/1743410000000-LeadOrigin");
const _1743420000000_AddIsConsignedToVehicle_1 = require("./migrations/1743420000000-AddIsConsignedToVehicle");
exports.AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 5432),
    username: process.env.DB_USERNAME ?? 'postgres',
    password: process.env.DB_PASSWORD ?? 'postgres',
    database: process.env.DB_DATABASE ?? 'auto_scan',
    synchronize: false,
    entities: [
        user_entity_1.UserEntity,
        chat_session_entity_1.ChatSessionEntity,
        chat_message_entity_1.ChatMessageEntity,
        chat_telemetry_event_entity_1.ChatTelemetryEventEntity,
        shop_entity_1.ShopEntity,
        vehicle_entity_1.VehicleEntity,
        lead_entity_1.LeadEntity,
        test_drive_entity_1.TestDriveEntity,
        lead_note_entity_1.LeadNoteEntity,
        qr_code_entity_1.QrCodeEntity,
        inventory_sync_log_entity_1.InventorySyncLogEntity,
        sale_closure_entity_1.SaleClosureEntity,
        subscription_entity_1.SubscriptionEntity,
        subscription_payment_entity_1.SubscriptionPaymentEntity,
    ],
    migrations: [
        _1743300000000_KafkaBootstrap_1.KafkaBootstrap1743300000000,
        _1743311000000_VehiclePhotoVariants_1.VehiclePhotoVariants1743311000000,
        _1743320000000_ChatAiUpgrade_1.ChatAiUpgrade1743320000000,
        _1743330000000_PlatformAdminBootstrap_1.PlatformAdminBootstrap1743330000000,
        _1743340000000_ShopSettingsPreferences_1.ShopSettingsPreferences1743340000000,
        _1743350000000_BillingProductionReadiness_1.BillingProductionReadiness1743350000000,
        _1743360000000_SubscriptionCatalogBootstrap_1.SubscriptionCatalogBootstrap1743360000000,
        _1743370000000_ShopInventoryIntegrationSettings_1.ShopInventoryIntegrationSettings1743370000000,
        _1743380000000_InventorySyncLogs_1.InventorySyncLogs1743380000000,
        _1743390000000_ShopInventoryRequestConfig_1.ShopInventoryRequestConfig1743390000000,
        _1743400000000_SaleClosures_1.SaleClosures1743400000000,
        _1743410000000_LeadOrigin_1.LeadOrigin1743410000000,
        _1743420000000_AddIsConsignedToVehicle_1.AddIsConsignedToVehicle1743420000000,
    ],
});
