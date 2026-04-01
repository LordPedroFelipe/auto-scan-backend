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
exports.SalesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const create_sale_closure_dto_1 = require("./dto/create-sale-closure.dto");
const sale_closures_query_dto_1 = require("./dto/sale-closures-query.dto");
const update_sale_closure_dto_1 = require("./dto/update-sale-closure.dto");
const sales_service_1 = require("./sales.service");
let SalesController = class SalesController {
    constructor(salesService) {
        this.salesService = salesService;
    }
    findAll(query) {
        return this.salesService.findAll(query);
    }
    getOptions() {
        return this.salesService.getOptions();
    }
    findOne(id) {
        return this.salesService.findOne(id);
    }
    create(dto) {
        return this.salesService.create(dto);
    }
    update(id, dto) {
        return this.salesService.update(id, dto);
    }
    remove(id) {
        return this.salesService.remove(id);
    }
};
exports.SalesController = SalesController;
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Listar fechamentos e vendas' }),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [sale_closures_query_dto_1.SaleClosuresQueryDto]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "findAll", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Listar op��es dos campos de fechamento' }),
    (0, common_1.Get)('options'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "getOptions", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Obter um fechamento por ID' }),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "findOne", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Criar fechamento de lead' }),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_sale_closure_dto_1.CreateSaleClosureDto]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "create", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Atualizar fechamento de lead' }),
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_sale_closure_dto_1.UpdateSaleClosureDto]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "update", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Remover fechamento de lead' }),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "remove", null);
exports.SalesController = SalesController = __decorate([
    (0, swagger_1.ApiTags)('Sales'),
    (0, common_1.Controller)('Sales'),
    __metadata("design:paramtypes", [sales_service_1.SalesService])
], SalesController);
