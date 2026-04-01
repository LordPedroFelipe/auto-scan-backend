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
exports.ShopsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const create_shop_dto_1 = require("./dto/create-shop.dto");
const create_shop_onboarding_dto_1 = require("./dto/create-shop-onboarding.dto");
const update_shop_dto_1 = require("./dto/update-shop.dto");
const shops_service_1 = require("./shops.service");
let ShopsController = class ShopsController {
    constructor(shopsService) {
        this.shopsService = shopsService;
    }
    findAll() {
        return this.shopsService.findAll();
    }
    findOne(id) {
        return this.shopsService.findOne(id);
    }
    listSellers(shopId) {
        return this.shopsService.listSellers(shopId);
    }
    create(dto) {
        return this.shopsService.create(dto);
    }
    createOnboarding(dto) {
        return this.shopsService.createOnboarding(dto);
    }
    addSeller(shopId, body) {
        return this.shopsService.addSeller(shopId, body.sellerId);
    }
    update(id, dto) {
        return this.shopsService.update(id, dto);
    }
    remove(id) {
        return this.shopsService.remove(id);
    }
    removeSeller(shopId, sellerId) {
        return this.shopsService.removeSeller(shopId, sellerId);
    }
};
exports.ShopsController = ShopsController;
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Listar lojas' }),
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ShopsController.prototype, "findAll", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Obter detalhes de uma loja' }),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ShopsController.prototype, "findOne", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Listar vendedores vinculados a uma loja' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)(':shopId/sellers'),
    __param(0, (0, common_1.Param)('shopId', new common_1.ParseUUIDPipe())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ShopsController.prototype, "listSellers", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Criar loja' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_shop_dto_1.CreateShopDto]),
    __metadata("design:returntype", void 0)
], ShopsController.prototype, "create", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Criar loja e usuario master no fluxo de onboarding' }),
    (0, common_1.Post)('onboarding'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_shop_onboarding_dto_1.CreateShopOnboardingDto]),
    __metadata("design:returntype", void 0)
], ShopsController.prototype, "createOnboarding", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Vincular vendedor a uma loja' }),
    (0, swagger_1.ApiBody)({ schema: { type: 'object', properties: { sellerId: { type: 'string', format: 'uuid' } }, required: ['sellerId'] } }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)(':shopId/sellers'),
    __param(0, (0, common_1.Param)('shopId', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ShopsController.prototype, "addSeller", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Atualizar loja' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_shop_dto_1.UpdateShopDto]),
    __metadata("design:returntype", void 0)
], ShopsController.prototype, "update", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Inativar loja' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ShopsController.prototype, "remove", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Remover vendedor da loja' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Delete)(':shopId/sellers/:sellerId'),
    __param(0, (0, common_1.Param)('shopId', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Param)('sellerId', new common_1.ParseUUIDPipe())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ShopsController.prototype, "removeSeller", null);
exports.ShopsController = ShopsController = __decorate([
    (0, swagger_1.ApiTags)('Shops'),
    (0, common_1.Controller)('Shops'),
    __metadata("design:paramtypes", [shops_service_1.ShopsService])
], ShopsController);
