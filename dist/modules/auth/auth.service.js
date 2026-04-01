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
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcrypt"));
const crypto_1 = require("crypto");
const email_service_1 = require("../email/email.service");
const email_templates_1 = require("../email/email.templates");
const users_service_1 = require("../users/users.service");
let AuthService = AuthService_1 = class AuthService {
    constructor(usersService, jwtService, configService, emailService) {
        this.usersService = usersService;
        this.jwtService = jwtService;
        this.configService = configService;
        this.emailService = emailService;
        this.logger = new common_1.Logger(AuthService_1.name);
    }
    async login(dto) {
        const user = await this.usersService.findByEmailWithPassword(dto.email);
        if (!user?.passwordHash) {
            throw new common_1.UnauthorizedException('Email ou senha invalidos.');
        }
        if (!user.isActive) {
            throw new common_1.UnauthorizedException('Este usuario esta inativo.');
        }
        const isValidPassword = await bcrypt.compare(dto.password, user.passwordHash);
        if (!isValidPassword) {
            throw new common_1.UnauthorizedException('Email ou senha invalidos.');
        }
        const safeUser = this.usersService.toSafeUser(user);
        const payload = {
            sub: safeUser.id,
            email: safeUser.email,
            roles: safeUser.roles,
            shopId: safeUser.shopId ?? null,
            shopName: safeUser.shop?.name ?? null,
            'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier': safeUser.id,
            'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress': safeUser.email,
            'http://schemas.microsoft.com/ws/2008/06/identity/claims/role': safeUser.roles,
            ShopId: safeUser.shopId ?? null,
            ShopName: safeUser.shop?.name ?? null,
            Permission: safeUser.claims ?? [],
        };
        return {
            token: await this.jwtService.signAsync(payload),
            user: {
                id: safeUser.id,
                userName: safeUser.userName,
                email: safeUser.email,
                phoneNumber: safeUser.phoneNumber,
                roles: safeUser.roles,
                shopId: safeUser.shopId,
                shopName: safeUser.shop?.name ?? null,
            },
        };
    }
    async register(dto) {
        const existingUser = await this.usersService.findByEmail(dto.email);
        if (existingUser) {
            throw new common_1.BadRequestException('Ja existe um usuario com este email.');
        }
        const createdUser = await this.usersService.create({
            userName: dto.userName,
            email: dto.email,
            phoneNumber: dto.phoneNumber,
            password: dto.password,
            roles: dto.roles,
            shopId: dto.shopId,
        });
        await this.sendWelcomeEmail(createdUser.id).catch((error) => {
            this.logger.warn(`Falha ao enviar email de boas-vindas: ${String(error)}`);
        });
        return this.login({
            email: dto.email,
            password: dto.password,
        });
    }
    async me(userId) {
        return this.usersService.findOne(userId);
    }
    async forgotPassword(dto) {
        const user = await this.usersService.findByEmail(dto.email);
        if (!user?.isActive) {
            return {
                success: true,
                message: 'Se existir uma conta com este email, enviaremos as instrucoes de recuperacao.',
            };
        }
        const token = (0, crypto_1.randomBytes)(32).toString('hex');
        const expiresAt = new Date(Date.now() + 1000 * 60 * 60);
        await this.usersService.savePasswordResetToken(user.id, token, expiresAt);
        const frontendBaseUrl = this.configService.get('FRONTEND_BASE_URL', 'http://localhost:4200');
        const resetUrl = `${frontendBaseUrl}/#/resetar-senha?token=${token}`;
        const result = await this.emailService.send({
            to: {
                email: user.email,
                name: user.userName,
            },
            subject: 'ScanDrive | Redefinicao de senha',
            html: (0, email_templates_1.buildResetPasswordEmailTemplate)({
                customerName: user.userName,
                resetUrl,
                expiresInText: '1 hora',
            }),
            text: `Oi, ${user.userName}. Use este link para redefinir sua senha: ${resetUrl}. O link expira em 1 hora.`,
        });
        return {
            success: true,
            message: 'Se existir uma conta com este email, enviaremos as instrucoes de recuperacao.',
        };
    }
    async resetPassword(dto) {
        const user = await this.usersService.findByPasswordResetToken(dto.token);
        if (!user?.passwordResetExpiresAt) {
            throw new common_1.BadRequestException('Token de recuperacao invalido.');
        }
        if (user.passwordResetExpiresAt.getTime() < Date.now()) {
            await this.usersService.clearPasswordResetToken(user.id);
            throw new common_1.BadRequestException('Token de recuperacao expirado.');
        }
        await this.usersService.updatePassword(user.id, dto.password);
        return {
            success: true,
            message: 'Senha redefinida com sucesso.',
        };
    }
    async sendWelcomeEmail(userId) {
        const user = await this.usersService.findOne(userId);
        const frontendBaseUrl = this.configService.get('FRONTEND_BASE_URL', 'http://localhost:4200');
        const loginUrl = `${frontendBaseUrl}/#/login?email=${encodeURIComponent(user.email)}`;
        const result = await this.emailService.send({
            to: {
                email: user.email,
                name: user.userName,
            },
            subject: 'ScanDrive | Sua conta esta pronta',
            html: (0, email_templates_1.buildWelcomeEmailTemplate)({
                customerName: user.userName,
                loginUrl,
                shopName: user.shop?.name ?? null,
            }),
            text: `Oi, ${user.userName}. Sua conta ScanDrive esta pronta. Acesse ${loginUrl} para entrar na plataforma.`,
        });
        if (result.delivered) {
            await this.usersService.markWelcomeEmailSent(userId);
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService,
        config_1.ConfigService,
        email_service_1.EmailService])
], AuthService);
