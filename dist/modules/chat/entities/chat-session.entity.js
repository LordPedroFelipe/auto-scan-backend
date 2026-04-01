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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatSessionEntity = void 0;
const typeorm_1 = require("typeorm");
const lead_entity_1 = require("../../leads/entities/lead.entity");
const shop_entity_1 = require("../../shops/entities/shop.entity");
const vehicle_entity_1 = require("../../vehicles/entities/vehicle.entity");
const chat_message_entity_1 = require("./chat-message.entity");
const chat_telemetry_event_entity_1 = require("./chat-telemetry-event.entity");
let ChatSessionEntity = class ChatSessionEntity {
};
exports.ChatSessionEntity = ChatSessionEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ChatSessionEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 120 }),
    __metadata("design:type", String)
], ChatSessionEntity.prototype, "sessionKey", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", Object)
], ChatSessionEntity.prototype, "shopId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", Object)
], ChatSessionEntity.prototype, "vehicleId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", Object)
], ChatSessionEntity.prototype, "leadId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => shop_entity_1.ShopEntity, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'shopId' }),
    __metadata("design:type", Object)
], ChatSessionEntity.prototype, "shop", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => vehicle_entity_1.VehicleEntity, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'vehicleId' }),
    __metadata("design:type", Object)
], ChatSessionEntity.prototype, "vehicle", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => lead_entity_1.LeadEntity, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'leadId' }),
    __metadata("design:type", Object)
], ChatSessionEntity.prototype, "lead", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', default: () => "'{}'::jsonb" }),
    __metadata("design:type", Object)
], ChatSessionEntity.prototype, "customerProfile", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], ChatSessionEntity.prototype, "summary", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', array: true, default: '{}' }),
    __metadata("design:type", Array)
], ChatSessionEntity.prototype, "lastRecommendedVehicleIds", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', array: true, default: '{}' }),
    __metadata("design:type", Array)
], ChatSessionEntity.prototype, "keywords", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], ChatSessionEntity.prototype, "messagesCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], ChatSessionEntity.prototype, "toolCallsCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], ChatSessionEntity.prototype, "handoffsCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz', nullable: true }),
    __metadata("design:type", Object)
], ChatSessionEntity.prototype, "lastCustomerMessageAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz', nullable: true }),
    __metadata("design:type", Object)
], ChatSessionEntity.prototype, "lastAssistantMessageAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => chat_message_entity_1.ChatMessageEntity, (message) => message.session),
    __metadata("design:type", Array)
], ChatSessionEntity.prototype, "messages", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => chat_telemetry_event_entity_1.ChatTelemetryEventEntity, (event) => event.session),
    __metadata("design:type", Array)
], ChatSessionEntity.prototype, "telemetryEvents", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ChatSessionEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], ChatSessionEntity.prototype, "updatedAt", void 0);
exports.ChatSessionEntity = ChatSessionEntity = __decorate([
    (0, typeorm_1.Index)('IDX_chat_session_session_key', ['sessionKey'], { unique: true }),
    (0, typeorm_1.Entity)('chat_sessions')
], ChatSessionEntity);
