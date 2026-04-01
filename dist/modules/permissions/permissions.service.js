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
exports.PermissionsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../users/entities/user.entity");
const AVAILABLE_ROLES = ['Admin', 'ShopOwner', 'ShopSeller', 'Seller', 'Support'];
const AVAILABLE_CLAIMS = [
    'Module.Users:Permission.View',
    'Module.Users:Permission.Create',
    'Module.Users:Permission.Edit',
    'Module.Users:Permission.Delete',
    'Module.Shops:Permission.View',
    'Module.Shops:Permission.Create',
    'Module.Shops:Permission.Edit',
    'Module.Vehicles:Permission.View',
    'Module.Vehicles:Permission.Create',
    'Module.Vehicles:Permission.Edit',
    'Module.Vehicles:Permission.Delete',
    'Module.Leads:Permission.View',
    'Module.Leads:Permission.Create',
    'Module.Leads:Permission.Edit',
    'Module.TestDrives:Permission.View',
    'Module.TestDrives:Permission.Create',
    'Module.Reports:Permission.View',
    'Module.Settings:Permission.View',
];
let PermissionsService = class PermissionsService {
    constructor(usersRepository) {
        this.usersRepository = usersRepository;
    }
    listRoles() {
        return AVAILABLE_ROLES;
    }
    listModules() {
        return Array.from(new Set(AVAILABLE_CLAIMS.map((claim) => claim.split(':')[0]))).sort();
    }
    listAvailableClaims() {
        return AVAILABLE_CLAIMS;
    }
    async getUserRoles(userId) {
        const user = await this.findUser(userId);
        return user.roles ?? [];
    }
    async updateUserRoles(userId, roles) {
        const user = await this.findUser(userId);
        user.roles = roles ?? [];
        await this.usersRepository.save(user);
        return { success: true };
    }
    async getUserClaims(userId) {
        const user = await this.findUser(userId);
        return user.claims ?? [];
    }
    async updateUserClaims(userId, claims) {
        const user = await this.findUser(userId);
        user.claims = claims ?? [];
        await this.usersRepository.save(user);
        return { success: true };
    }
    async findUser(userId) {
        const user = await this.usersRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException('Usuário não encontrado.');
        }
        return user;
    }
};
exports.PermissionsService = PermissionsService;
exports.PermissionsService = PermissionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.UserEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], PermissionsService);
