"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const bcrypt = __importStar(require("bcrypt"));
const crypto_1 = require("crypto");
const typeorm_2 = require("typeorm");
const shop_entity_1 = require("../shops/entities/shop.entity");
const user_entity_1 = require("./entities/user.entity");
let UsersService = class UsersService {
    constructor(usersRepository, shopsRepository) {
        this.usersRepository = usersRepository;
        this.shopsRepository = shopsRepository;
    }
    async findAll(query = {}) {
        const pageNumber = query.PageNumber ?? query.pageNumber ?? 1;
        const pageSize = query.PageSize ?? query.pageSize ?? 10;
        const search = query.q ?? query.search;
        const shopId = query.ShopId ?? query.shopId;
        const qb = this.usersRepository
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.shop', 'shop');
        if (shopId) {
            qb.andWhere('user.shopId = :shopId', { shopId });
        }
        if (search) {
            qb.andWhere('(user.userName ILIKE :search OR user.email ILIKE :search OR user.phoneNumber ILIKE :search)', { search: `%${search}%` });
        }
        qb.orderBy('user.createdAt', 'DESC');
        qb.skip((pageNumber - 1) * pageSize);
        qb.take(pageSize);
        const [items, totalCount] = await qb.getManyAndCount();
        return {
            items,
            pageNumber,
            pageSize,
            totalCount,
            totalPages: Math.ceil(totalCount / pageSize) || 1,
        };
    }
    async listItems() {
        const users = await this.usersRepository.find({
            select: {
                id: true,
                userName: true,
                email: true,
            },
            order: {
                userName: 'ASC',
            },
        });
        return users.map((user) => ({
            id: user.id,
            label: `${user.userName} (${user.email})`,
            description: `${user.userName} (${user.email})`,
            userName: user.userName,
            email: user.email,
        }));
    }
    async findOne(id) {
        const user = await this.usersRepository.findOne({
            where: { id },
            relations: {
                shop: true,
            },
        });
        if (!user) {
            throw new common_1.NotFoundException('Usuário não encontrado.');
        }
        return user;
    }
    async findByEmail(email) {
        return this.usersRepository.findOne({
            where: { email: email.toLowerCase() },
            relations: {
                shop: true,
            },
        });
    }
    async findByEmailWithPassword(email) {
        return this.usersRepository
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.shop', 'shop')
            .addSelect('user.passwordHash')
            .where('LOWER(user.email) = LOWER(:email)', { email })
            .getOne();
    }
    async create(dto) {
        const existingUser = await this.findByEmail(dto.email);
        if (existingUser) {
            throw new common_1.BadRequestException('Já existe um usuário com este email.');
        }
        if (dto.shopId) {
            await this.ensureShopExists(dto.shopId);
        }
        const passwordHash = dto.password
            ? await bcrypt.hash(dto.password, 10)
            : undefined;
        const user = this.usersRepository.create({
            userName: dto.userName,
            email: dto.email.toLowerCase(),
            phoneNumber: dto.phoneNumber ?? null,
            passwordHash,
            roles: dto.roles ?? ['Seller'],
            claims: [],
            emailConfirmed: false,
            lockoutEnabled: false,
            accessFailedCount: 0,
            isActive: dto.isActive ?? true,
            passwordResetTokenHash: null,
            passwordResetExpiresAt: null,
            welcomeEmailSentAt: null,
            shopId: dto.shopId ?? null,
        });
        const savedUser = await this.usersRepository.save(user);
        return this.findOne(savedUser.id);
    }
    async update(id, dto) {
        const user = await this.findOne(id);
        if (dto.email && dto.email.toLowerCase() !== user.email.toLowerCase()) {
            const existingUser = await this.findByEmail(dto.email);
            if (existingUser && existingUser.id !== id) {
                throw new common_1.BadRequestException('Já existe um usuário com este email.');
            }
        }
        if (dto.shopId) {
            await this.ensureShopExists(dto.shopId);
        }
        if (dto.password) {
            user.passwordHash = await bcrypt.hash(dto.password, 10);
        }
        user.userName = dto.userName ?? user.userName;
        user.email = dto.email?.toLowerCase() ?? user.email;
        user.phoneNumber = dto.phoneNumber ?? user.phoneNumber;
        user.roles = dto.roles ?? user.roles;
        user.claims = dto.claims ?? user.claims;
        user.shopId = dto.shopId ?? user.shopId;
        user.isActive = dto.isActive ?? user.isActive;
        await this.usersRepository.save(user);
        return this.findOne(id);
    }
    async remove(id) {
        const user = await this.findOne(id);
        await this.usersRepository.remove(user);
        return { success: true };
    }
    async savePasswordResetToken(userId, token, expiresAt) {
        const user = await this.findOne(userId);
        user.passwordResetTokenHash = this.hashToken(token);
        user.passwordResetExpiresAt = expiresAt;
        await this.usersRepository.save(user);
    }
    async findByPasswordResetToken(token) {
        return this.usersRepository.findOne({
            where: {
                passwordResetTokenHash: this.hashToken(token),
            },
            relations: {
                shop: true,
            },
        });
    }
    async updatePassword(userId, password) {
        const user = await this.findOne(userId);
        user.passwordHash = await bcrypt.hash(password, 10);
        user.passwordResetTokenHash = null;
        user.passwordResetExpiresAt = null;
        await this.usersRepository.save(user);
        return this.findOne(userId);
    }
    async clearPasswordResetToken(userId) {
        const user = await this.findOne(userId);
        user.passwordResetTokenHash = null;
        user.passwordResetExpiresAt = null;
        await this.usersRepository.save(user);
    }
    async markWelcomeEmailSent(userId) {
        const user = await this.findOne(userId);
        user.welcomeEmailSentAt = new Date();
        await this.usersRepository.save(user);
    }
    toSafeUser(user) {
        const { passwordHash: _passwordHash, ...safeUser } = user;
        return safeUser;
    }
    hashToken(token) {
        return (0, crypto_1.createHash)('sha256').update(token).digest('hex');
    }
    async ensureShopExists(shopId) {
        const shop = await this.shopsRepository.findOne({ where: { id: shopId } });
        if (!shop) {
            throw new common_1.BadRequestException('Loja não encontrada.');
        }
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.UserEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(shop_entity_1.ShopEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], UsersService);
