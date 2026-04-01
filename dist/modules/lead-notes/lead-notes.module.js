"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeadNotesModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const lead_entity_1 = require("../leads/entities/lead.entity");
const user_entity_1 = require("../users/entities/user.entity");
const lead_notes_controller_1 = require("./lead-notes.controller");
const lead_notes_service_1 = require("./lead-notes.service");
const lead_note_entity_1 = require("./entities/lead-note.entity");
let LeadNotesModule = class LeadNotesModule {
};
exports.LeadNotesModule = LeadNotesModule;
exports.LeadNotesModule = LeadNotesModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([lead_note_entity_1.LeadNoteEntity, lead_entity_1.LeadEntity, user_entity_1.UserEntity])],
        controllers: [lead_notes_controller_1.LeadNotesController],
        providers: [lead_notes_service_1.LeadNotesService],
    })
], LeadNotesModule);
