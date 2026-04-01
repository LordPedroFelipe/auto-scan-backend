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
exports.LeadNotesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const create_lead_note_dto_1 = require("./dto/create-lead-note.dto");
const lead_notes_query_dto_1 = require("./dto/lead-notes-query.dto");
const update_lead_note_dto_1 = require("./dto/update-lead-note.dto");
const lead_notes_service_1 = require("./lead-notes.service");
let LeadNotesController = class LeadNotesController {
    constructor(leadNotesService) {
        this.leadNotesService = leadNotesService;
    }
    findAll(query) {
        return this.leadNotesService.findAll(query);
    }
    types() {
        return this.leadNotesService.listTypes();
    }
    findByLead(leadId, query) {
        return this.leadNotesService.findByLead(leadId, query);
    }
    findOne(id) {
        return this.leadNotesService.findOne(id);
    }
    create(dto) {
        return this.leadNotesService.create(dto);
    }
    update(id, dto) {
        return this.leadNotesService.update(id, dto);
    }
    remove(id) {
        return this.leadNotesService.remove(id);
    }
};
exports.LeadNotesController = LeadNotesController;
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Listar anotacoes de lead' }),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [lead_notes_query_dto_1.LeadNotesQueryDto]),
    __metadata("design:returntype", void 0)
], LeadNotesController.prototype, "findAll", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Listar tipos disponiveis de anotacao' }),
    (0, common_1.Get)('types'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], LeadNotesController.prototype, "types", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Listar anotacoes de um lead especifico' }),
    (0, common_1.Get)('lead/:leadId'),
    __param(0, (0, common_1.Param)('leadId', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, lead_notes_query_dto_1.LeadNotesQueryDto]),
    __metadata("design:returntype", void 0)
], LeadNotesController.prototype, "findByLead", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Obter anotacao por ID' }),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LeadNotesController.prototype, "findOne", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Criar anotacao de lead' }),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_lead_note_dto_1.CreateLeadNoteDto]),
    __metadata("design:returntype", void 0)
], LeadNotesController.prototype, "create", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Atualizar anotacao de lead' }),
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_lead_note_dto_1.UpdateLeadNoteDto]),
    __metadata("design:returntype", void 0)
], LeadNotesController.prototype, "update", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Remover anotacao de lead' }),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LeadNotesController.prototype, "remove", null);
exports.LeadNotesController = LeadNotesController = __decorate([
    (0, swagger_1.ApiTags)('LeadNotes'),
    (0, common_1.Controller)('LeadNotes'),
    __metadata("design:paramtypes", [lead_notes_service_1.LeadNotesService])
], LeadNotesController);
