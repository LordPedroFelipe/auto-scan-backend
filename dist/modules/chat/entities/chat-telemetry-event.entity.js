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
exports.ChatTelemetryEventEntity = void 0;
const typeorm_1 = require("typeorm");
const chat_session_entity_1 = require("./chat-session.entity");
let ChatTelemetryEventEntity = class ChatTelemetryEventEntity {
};
exports.ChatTelemetryEventEntity = ChatTelemetryEventEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ChatTelemetryEventEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], ChatTelemetryEventEntity.prototype, "sessionId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => chat_session_entity_1.ChatSessionEntity, (session) => session.telemetryEvents, { nullable: false, onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'sessionId' }),
    __metadata("design:type", chat_session_entity_1.ChatSessionEntity)
], ChatTelemetryEventEntity.prototype, "session", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 60 }),
    __metadata("design:type", String)
], ChatTelemetryEventEntity.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, default: 'info' }),
    __metadata("design:type", String)
], ChatTelemetryEventEntity.prototype, "level", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], ChatTelemetryEventEntity.prototype, "message", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], ChatTelemetryEventEntity.prototype, "payload", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ChatTelemetryEventEntity.prototype, "createdAt", void 0);
exports.ChatTelemetryEventEntity = ChatTelemetryEventEntity = __decorate([
    (0, typeorm_1.Index)('IDX_chat_telemetry_session_created', ['sessionId', 'createdAt']),
    (0, typeorm_1.Entity)('chat_telemetry_events')
], ChatTelemetryEventEntity);
