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
var ShopsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShopsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const bcrypt = __importStar(require("bcrypt"));
const typeorm_2 = require("typeorm");
const email_service_1 = require("../email/email.service");
const email_templates_1 = require("../email/email.templates");
const inventory_sync_service_1 = require("../inventory-sync/inventory-sync.service");
const user_entity_1 = require("../users/entities/user.entity");
const shop_entity_1 = require("./entities/shop.entity");
let ShopsService = ShopsService_1 = class ShopsService {
    constructor(shopsRepository, usersRepository, dataSource, emailService, configService, inventorySyncService) {
        this.shopsRepository = shopsRepository;
        this.usersRepository = usersRepository;
        this.dataSource = dataSource;
        this.emailService = emailService;
        this.configService = configService;
        this.inventorySyncService = inventorySyncService;
        this.logger = new common_1.Logger(ShopsService_1.name);
    }
    async findAll() {
        return this.shopsRepository.find({
            relations: {
                owner: true,
                users: true,
            },
            order: {
                createdAt: 'DESC',
            },
        });
    }
    async findOne(id) {
        const shop = await this.shopsRepository.findOne({
            where: { id },
            relations: {
                owner: true,
                users: true,
            },
        });
        if (!shop) {
            throw new common_1.NotFoundException('Loja nao encontrada.');
        }
        return shop;
    }
    async create(dto) {
        if (dto.ownerId) {
            await this.ensureOwnerExists(dto.ownerId);
        }
        if (dto.inventoryMasterUserId) {
            await this.ensureUserExists(dto.inventoryMasterUserId, 'Usuario master da integracao nao encontrado.');
        }
        if (dto.inventorySellerUserId) {
            await this.ensureUserExists(dto.inventorySellerUserId, 'Usuario vendedor da integracao nao encontrado.');
        }
        const shop = this.shopsRepository.create({
            name: dto.name,
            description: dto.description ?? null,
            cnpj: dto.cnpj ?? null,
            email: dto.email?.toLowerCase() ?? null,
            phoneNumber: dto.phoneNumber ?? null,
            addressLine: dto.addressLine ?? null,
            city: dto.city ?? null,
            state: dto.state ?? null,
            zipCode: dto.zipCode ?? null,
            qrCodeLimit: dto.qrCodeLimit ?? 10,
            inventoryFeedUrl: dto.inventoryFeedUrl ?? null,
            inventoryFeedMethod: dto.inventoryFeedMethod?.trim().toUpperCase() ?? null,
            inventoryRequestBody: dto.inventoryRequestBody ?? null,
            inventoryRequestHeaders: dto.inventoryRequestHeaders ?? null,
            inventorySourceCode: dto.inventorySourceCode ?? null,
            inventorySourceName: dto.inventorySourceName ?? null,
            inventoryImageBucketBaseUrl: dto.inventoryImageBucketBaseUrl ?? null,
            inventoryMasterUserId: dto.inventoryMasterUserId ?? null,
            inventorySellerUserId: dto.inventorySellerUserId ?? null,
            inventorySyncCron: dto.inventorySyncCron ?? null,
            inventorySyncEnabled: dto.inventorySyncEnabled ?? false,
            inventoryLastSyncAt: null,
            inventoryLastSyncStatus: null,
            inventoryLastSyncError: null,
            ownerId: dto.ownerId ?? null,
            isActive: dto.isActive ?? true,
            isDeleted: false,
        });
        const savedShop = await this.shopsRepository.save(shop);
        await this.inventorySyncService.initializeSchedules();
        return this.findOne(savedShop.id);
    }
    async createOnboarding(dto) {
        const normalizedShopEmail = dto.email.toLowerCase();
        const normalizedMasterEmail = dto.masterUser.email.toLowerCase();
        if (normalizedShopEmail !== normalizedMasterEmail) {
            throw new common_1.BadRequestException('O email da loja e do usuario master devem ser o mesmo neste fluxo inicial.');
        }
        const existingUser = await this.usersRepository.findOne({
            where: { email: normalizedMasterEmail },
        });
        if (existingUser) {
            throw new common_1.BadRequestException('Ja existe um usuario com este email.');
        }
        if (dto.cnpj) {
            const existingShop = await this.shopsRepository.findOne({
                where: { cnpj: dto.cnpj },
            });
            if (existingShop) {
                throw new common_1.BadRequestException('Ja existe uma loja com este CNPJ.');
            }
        }
        const passwordHash = await bcrypt.hash(dto.masterUser.password, 10);
        const result = await this.dataSource.transaction(async (manager) => {
            const shopRepository = manager.getRepository(shop_entity_1.ShopEntity);
            const userRepository = manager.getRepository(user_entity_1.UserEntity);
            const shop = shopRepository.create({
                name: dto.name,
                description: dto.description ?? null,
                cnpj: dto.cnpj ?? null,
                email: normalizedShopEmail,
                phoneNumber: dto.phoneNumber ?? dto.masterUser.phoneNumber ?? null,
                addressLine: dto.addressLine ?? null,
                city: dto.city ?? null,
                state: dto.state ?? null,
                zipCode: dto.zipCode ?? null,
                qrCodeLimit: dto.qrCodeLimit ?? 10,
                inventoryFeedUrl: dto.inventoryFeedUrl ?? null,
                inventorySourceCode: dto.inventorySourceCode ?? null,
                inventorySyncCron: dto.inventorySyncCron ?? null,
                inventorySyncEnabled: dto.inventorySyncEnabled ?? false,
                inventoryLastSyncAt: null,
                inventoryLastSyncStatus: null,
                inventoryLastSyncError: null,
                ownerId: null,
                isActive: true,
                isDeleted: false,
            });
            const savedShop = await shopRepository.save(shop);
            const masterUser = userRepository.create({
                userName: dto.masterUser.userName,
                email: normalizedMasterEmail,
                phoneNumber: dto.masterUser.phoneNumber ?? dto.phoneNumber ?? null,
                passwordHash,
                roles: ['ShopManager'],
                claims: [],
                emailConfirmed: false,
                lockoutEnabled: false,
                accessFailedCount: 0,
                isActive: true,
                passwordResetTokenHash: null,
                passwordResetExpiresAt: null,
                welcomeEmailSentAt: null,
                shopId: savedShop.id,
            });
            const savedMasterUser = await userRepository.save(masterUser);
            savedShop.ownerId = savedMasterUser.id;
            await shopRepository.save(savedShop);
            return {
                shopId: savedShop.id,
                masterUserId: savedMasterUser.id,
            };
        });
        const shop = await this.findOne(result.shopId);
        const masterUser = await this.usersRepository.findOne({
            where: { id: result.masterUserId },
            relations: { shop: true },
        });
        if (masterUser) {
            await this.sendWelcomeEmail(masterUser).catch((error) => {
                this.logger.warn(`Falha ao enviar boas-vindas no onboarding: ${String(error)}`);
            });
        }
        return {
            shop,
            masterUser,
        };
    }
    async update(id, dto) {
        const shop = await this.findOne(id);
        if (dto.ownerId) {
            await this.ensureOwnerExists(dto.ownerId);
        }
        if (dto.inventoryMasterUserId) {
            await this.ensureUserExists(dto.inventoryMasterUserId, 'Usuario master da integracao nao encontrado.');
        }
        if (dto.inventorySellerUserId) {
            await this.ensureUserExists(dto.inventorySellerUserId, 'Usuario vendedor da integracao nao encontrado.');
        }
        shop.name = dto.name ?? shop.name;
        shop.description = dto.description ?? shop.description;
        shop.cnpj = dto.cnpj ?? shop.cnpj;
        shop.email = dto.email?.toLowerCase() ?? shop.email;
        shop.phoneNumber = dto.phoneNumber ?? shop.phoneNumber;
        shop.addressLine = dto.addressLine ?? shop.addressLine;
        shop.city = dto.city ?? shop.city;
        shop.state = dto.state ?? shop.state;
        shop.zipCode = dto.zipCode ?? shop.zipCode;
        shop.qrCodeLimit = dto.qrCodeLimit ?? shop.qrCodeLimit;
        if ('inventoryFeedUrl' in dto) {
            shop.inventoryFeedUrl = dto.inventoryFeedUrl ?? null;
        }
        if ('inventoryFeedMethod' in dto) {
            shop.inventoryFeedMethod = dto.inventoryFeedMethod?.trim().toUpperCase() ?? null;
        }
        if ('inventoryRequestBody' in dto) {
            shop.inventoryRequestBody = dto.inventoryRequestBody ?? null;
        }
        if ('inventoryRequestHeaders' in dto) {
            shop.inventoryRequestHeaders = dto.inventoryRequestHeaders ?? null;
        }
        if ('inventorySourceCode' in dto) {
            shop.inventorySourceCode = dto.inventorySourceCode ?? null;
        }
        if ('inventorySourceName' in dto) {
            shop.inventorySourceName = dto.inventorySourceName ?? null;
        }
        if ('inventoryImageBucketBaseUrl' in dto) {
            shop.inventoryImageBucketBaseUrl = dto.inventoryImageBucketBaseUrl ?? null;
        }
        if ('inventoryMasterUserId' in dto) {
            shop.inventoryMasterUserId = dto.inventoryMasterUserId ?? null;
        }
        if ('inventorySellerUserId' in dto) {
            shop.inventorySellerUserId = dto.inventorySellerUserId ?? null;
        }
        if ('inventorySyncCron' in dto) {
            shop.inventorySyncCron = dto.inventorySyncCron ?? null;
        }
        if ('inventorySyncEnabled' in dto) {
            shop.inventorySyncEnabled = dto.inventorySyncEnabled ?? false;
        }
        shop.ownerId = dto.ownerId ?? shop.ownerId;
        shop.isActive = dto.isActive ?? shop.isActive;
        await this.shopsRepository.save(shop);
        await this.inventorySyncService.initializeSchedules();
        return this.findOne(id);
    }
    async remove(id) {
        const shop = await this.findOne(id);
        shop.isDeleted = true;
        shop.isActive = false;
        await this.shopsRepository.save(shop);
        return { success: true };
    }
    async listSellers(shopId) {
        await this.findOne(shopId);
        return this.usersRepository.find({
            where: { shopId },
            order: { userName: 'ASC' },
        });
    }
    async addSeller(shopId, sellerId) {
        await this.findOne(shopId);
        const seller = await this.usersRepository.findOne({ where: { id: sellerId } });
        if (!seller) {
            throw new common_1.NotFoundException('Vendedor nao encontrado.');
        }
        seller.shopId = shopId;
        if (!seller.roles?.length) {
            seller.roles = ['ShopSeller'];
        }
        await this.usersRepository.save(seller);
        return { success: true };
    }
    async removeSeller(shopId, sellerId) {
        await this.findOne(shopId);
        const seller = await this.usersRepository.findOne({
            where: { id: sellerId, shopId },
        });
        if (!seller) {
            throw new common_1.NotFoundException('Vendedor nao encontrado nesta loja.');
        }
        seller.shopId = null;
        await this.usersRepository.save(seller);
        return { success: true };
    }
    async ensureOwnerExists(ownerId) {
        const owner = await this.usersRepository.findOne({ where: { id: ownerId } });
        if (!owner) {
            throw new common_1.BadRequestException('Usuario proprietario nao encontrado.');
        }
    }
    async ensureUserExists(userId, message) {
        const user = await this.usersRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.BadRequestException(message);
        }
    }
    async sendWelcomeEmail(user) {
        const frontendBaseUrl = this.configService.get('FRONTEND_BASE_URL', 'http://localhost:4200');
        const loginUrl = `${frontendBaseUrl}/#/login?email=${encodeURIComponent(user.email)}`;
        const result = await this.emailService.send({
            to: {
                email: user.email,
                name: user.userName,
            },
            subject: 'ScanDrive | Sua conta da loja esta pronta',
            html: (0, email_templates_1.buildWelcomeEmailTemplate)({
                customerName: user.userName,
                loginUrl,
                shopName: user.shop?.name ?? null,
            }),
            text: `Oi, ${user.userName}. Sua conta da loja ja esta pronta. Entre em ${loginUrl}.`,
        });
        if (result.delivered) {
            user.welcomeEmailSentAt = new Date();
            await this.usersRepository.save(user);
        }
    }
};
exports.ShopsService = ShopsService;
exports.ShopsService = ShopsService = ShopsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(shop_entity_1.ShopEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.UserEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource,
        email_service_1.EmailService,
        config_1.ConfigService,
        inventory_sync_service_1.InventorySyncService])
], ShopsService);
