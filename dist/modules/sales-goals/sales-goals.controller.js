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
exports.SalesGoalsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../auth/current-user.decorator");
const create_sales_goal_dto_1 = require("./dto/create-sales-goal.dto");
const create_sales_goal_dto_2 = require("./dto/create-sales-goal.dto");
const create_sales_goal_dto_3 = require("./dto/create-sales-goal.dto");
const sales_goals_service_1 = require("./sales-goals.service");
let SalesGoalsController = class SalesGoalsController {
    constructor(salesGoalsService) {
        this.salesGoalsService = salesGoalsService;
    }
    findAll(query, user) {
        const shopId = user.shopId || query.shopId;
        return this.salesGoalsService.findAll(query, shopId);
    }
    findOne(id) {
        return this.salesGoalsService.findOne(id);
    }
    create(dto, user) {
        const shopId = user.shopId;
        if (!shopId) {
            throw new Error('Usuário deve pertencer a uma loja');
        }
        return this.salesGoalsService.create(dto, shopId);
    }
    update(id, dto) {
        return this.salesGoalsService.update(id, dto);
    }
    remove(id) {
        return this.salesGoalsService.remove(id);
    }
    getGoalsWithProgress(user, year, month) {
        const shopId = user.shopId;
        if (!shopId) {
            throw new Error('Usuário deve pertencer a uma loja');
        }
        return this.salesGoalsService.getGoalsWithProgress(shopId, year ? parseInt(year) : undefined, month ? parseInt(month) : undefined);
    }
    getSellerGoals(user, year, month) {
        return this.salesGoalsService.getSellerGoals(user.userId, year ? parseInt(year) : undefined, month ? parseInt(month) : undefined);
    }
    updateCurrentValues() {
        return this.salesGoalsService.updateCurrentValues();
    }
};
exports.SalesGoalsController = SalesGoalsController;
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Listar metas de vendas' }),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_sales_goal_dto_2.SalesGoalsQueryDto, Object]),
    __metadata("design:returntype", void 0)
], SalesGoalsController.prototype, "findAll", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Obter meta por ID' }),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SalesGoalsController.prototype, "findOne", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Criar meta de vendas' }),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_sales_goal_dto_1.CreateSalesGoalDto, Object]),
    __metadata("design:returntype", void 0)
], SalesGoalsController.prototype, "create", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Atualizar meta de vendas' }),
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_sales_goal_dto_3.UpdateSalesGoalDto]),
    __metadata("design:returntype", void 0)
], SalesGoalsController.prototype, "update", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Excluir meta de vendas' }),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SalesGoalsController.prototype, "remove", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Obter metas com progresso' }),
    (0, common_1.Get)('progress/overview'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('year')),
    __param(2, (0, common_1.Query)('month')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], SalesGoalsController.prototype, "getGoalsWithProgress", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Obter metas do vendedor' }),
    (0, common_1.Get)('seller/me'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('year')),
    __param(2, (0, common_1.Query)('month')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], SalesGoalsController.prototype, "getSellerGoals", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Atualizar valores atuais das metas' }),
    (0, common_1.Post)('update-current-values'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SalesGoalsController.prototype, "updateCurrentValues", null);
exports.SalesGoalsController = SalesGoalsController = __decorate([
    (0, swagger_1.ApiTags)('Sales Goals'),
    (0, common_1.Controller)('SalesGoals'),
    __metadata("design:paramtypes", [sales_goals_service_1.SalesGoalsService])
], SalesGoalsController);
