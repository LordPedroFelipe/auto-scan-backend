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
exports.LeadsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const create_lead_dto_1 = require("./dto/create-lead.dto");
const leads_query_dto_1 = require("./dto/leads-query.dto");
const update_lead_dto_1 = require("./dto/update-lead.dto");
const leads_service_1 = require("./leads.service");
let LeadsController = class LeadsController {
    constructor(leadsService) {
        this.leadsService = leadsService;
    }
    findAll(query) {
        return this.leadsService.findAll(query);
    }
    statuses() {
        return this.leadsService.listStatuses();
    }
    crmDetail(id) {
        return this.leadsService.crmDetail(id);
    }
    findOne(id) {
        return this.leadsService.findOne(id);
    }
    create(dto, request) {
        return this.leadsService.create(dto, request);
    }
    update(id, dto) {
        return this.leadsService.update(id, dto);
    }
    remove(id) {
        return this.leadsService.remove(id);
    }
};
exports.LeadsController = LeadsController;
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Listar leads com filtros' }),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [leads_query_dto_1.LeadsQueryDto]),
    __metadata("design:returntype", void 0)
], LeadsController.prototype, "findAll", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Listar status disponiveis para leads' }),
    (0, common_1.Get)('status'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], LeadsController.prototype, "statuses", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Obter visao CRM completa de um lead' }),
    (0, common_1.Get)(':id/crm'),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LeadsController.prototype, "crmDetail", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Obter um lead por ID' }),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LeadsController.prototype, "findOne", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Criar lead' }),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_lead_dto_1.CreateLeadDto, Object]),
    __metadata("design:returntype", void 0)
], LeadsController.prototype, "create", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Atualizar lead' }),
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_lead_dto_1.UpdateLeadDto]),
    __metadata("design:returntype", void 0)
], LeadsController.prototype, "update", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Remover lead' }),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LeadsController.prototype, "remove", null);
exports.LeadsController = LeadsController = __decorate([
    (0, swagger_1.ApiTags)('Leads'),
    (0, common_1.Controller)('Lead'),
    __metadata("design:paramtypes", [leads_service_1.LeadsService])
], LeadsController);
