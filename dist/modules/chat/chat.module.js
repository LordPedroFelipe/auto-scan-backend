"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const lead_entity_1 = require("../leads/entities/lead.entity");
const shop_entity_1 = require("../shops/entities/shop.entity");
const test_drive_entity_1 = require("../test-drives/entities/test-drive.entity");
const user_entity_1 = require("../users/entities/user.entity");
const vehicle_entity_1 = require("../vehicles/entities/vehicle.entity");
const chat_controller_1 = require("./chat.controller");
const chat_service_1 = require("./chat.service");
const chat_message_entity_1 = require("./entities/chat-message.entity");
const chat_session_entity_1 = require("./entities/chat-session.entity");
const chat_telemetry_event_entity_1 = require("./entities/chat-telemetry-event.entity");
let ChatModule = class ChatModule {
};
exports.ChatModule = ChatModule;
exports.ChatModule = ChatModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                shop_entity_1.ShopEntity,
                vehicle_entity_1.VehicleEntity,
                lead_entity_1.LeadEntity,
                user_entity_1.UserEntity,
                test_drive_entity_1.TestDriveEntity,
                chat_session_entity_1.ChatSessionEntity,
                chat_message_entity_1.ChatMessageEntity,
                chat_telemetry_event_entity_1.ChatTelemetryEventEntity,
            ]),
        ],
        controllers: [chat_controller_1.ChatController],
        providers: [chat_service_1.ChatService],
    })
], ChatModule);
