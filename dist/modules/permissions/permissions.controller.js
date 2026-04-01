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
exports.PermissionsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const permissions_service_1 = require("./permissions.service");
let PermissionsController = class PermissionsController {
    constructor(permissionsService) {
        this.permissionsService = permissionsService;
    }
    roles() {
        return this.permissionsService.listRoles();
    }
    modules() {
        return this.permissionsService.listModules();
    }
    availableClaims() {
        return this.permissionsService.listAvailableClaims();
    }
    userRoles(userId) {
        return this.permissionsService.getUserRoles(userId);
    }
    updateUserRoles(userId, roles) {
        return this.permissionsService.updateUserRoles(userId, roles);
    }
    userClaims(userId) {
        return this.permissionsService.getUserClaims(userId);
    }
    updateUserClaims(userId, claims) {
        return this.permissionsService.updateUserClaims(userId, claims);
    }
};
exports.PermissionsController = PermissionsController;
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Listar papeis disponiveis' }),
    (0, common_1.Get)('roles'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PermissionsController.prototype, "roles", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Listar modulos disponiveis para claims' }),
    (0, common_1.Get)('modules'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PermissionsController.prototype, "modules", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Listar claims disponiveis' }),
    (0, common_1.Get)('available-claims'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PermissionsController.prototype, "availableClaims", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Listar papeis de um usuario' }),
    (0, common_1.Get)('user/:userId/roles'),
    __param(0, (0, common_1.Param)('userId', new common_1.ParseUUIDPipe())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PermissionsController.prototype, "userRoles", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Atualizar papeis de um usuario' }),
    (0, swagger_1.ApiBody)({ schema: { type: 'array', items: { type: 'string' }, example: ['Admin', 'Support'] } }),
    (0, common_1.Post)('user/:userId/roles'),
    __param(0, (0, common_1.Param)('userId', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array]),
    __metadata("design:returntype", void 0)
], PermissionsController.prototype, "updateUserRoles", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Listar claims de um usuario' }),
    (0, common_1.Get)('user/:userId/claims'),
    __param(0, (0, common_1.Param)('userId', new common_1.ParseUUIDPipe())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PermissionsController.prototype, "userClaims", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Atualizar claims de um usuario' }),
    (0, swagger_1.ApiBody)({ schema: { type: 'array', items: { type: 'string' }, example: ['Module.Users:Permission.View'] } }),
    (0, common_1.Post)('user/:userId/claims'),
    __param(0, (0, common_1.Param)('userId', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array]),
    __metadata("design:returntype", void 0)
], PermissionsController.prototype, "updateUserClaims", null);
exports.PermissionsController = PermissionsController = __decorate([
    (0, swagger_1.ApiTags)('Permissions'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('Permissions'),
    __metadata("design:paramtypes", [permissions_service_1.PermissionsService])
], PermissionsController);
