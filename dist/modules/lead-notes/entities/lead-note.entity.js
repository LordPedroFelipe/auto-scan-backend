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
exports.LeadNoteEntity = exports.LeadNoteType = void 0;
const typeorm_1 = require("typeorm");
const lead_entity_1 = require("../../leads/entities/lead.entity");
const user_entity_1 = require("../../users/entities/user.entity");
var LeadNoteType;
(function (LeadNoteType) {
    LeadNoteType["Nota"] = "Nota";
    LeadNoteType["Aviso"] = "Aviso";
    LeadNoteType["Contato"] = "Contato";
})(LeadNoteType || (exports.LeadNoteType = LeadNoteType = {}));
let LeadNoteEntity = class LeadNoteEntity {
};
exports.LeadNoteEntity = LeadNoteEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], LeadNoteEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], LeadNoteEntity.prototype, "leadId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", Object)
], LeadNoteEntity.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => lead_entity_1.LeadEntity, { nullable: false }),
    (0, typeorm_1.JoinColumn)({ name: 'leadId' }),
    __metadata("design:type", lead_entity_1.LeadEntity)
], LeadNoteEntity.prototype, "lead", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.UserEntity, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", Object)
], LeadNoteEntity.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], LeadNoteEntity.prototype, "comment", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: LeadNoteType,
        default: LeadNoteType.Nota,
    }),
    __metadata("design:type", String)
], LeadNoteEntity.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], LeadNoteEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], LeadNoteEntity.prototype, "updatedAt", void 0);
exports.LeadNoteEntity = LeadNoteEntity = __decorate([
    (0, typeorm_1.Entity)('lead_notes')
], LeadNoteEntity);
