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
var EmailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nodemailer = __importStar(require("nodemailer"));
let EmailService = EmailService_1 = class EmailService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(EmailService_1.name);
        this.transporterPromise = null;
    }
    async send(options) {
        const transporter = await this.getTransporter();
        const recipients = Array.isArray(options.to) ? options.to : [options.to];
        const fromName = this.configService.get('MAIL_FROM_NAME', 'ScanDrive');
        const fromEmail = this.configService.get('MAIL_FROM_EMAIL', 'no-reply@scandrive.local');
        if (!transporter) {
            this.logger.warn(`SMTP nao configurado. Email "${options.subject}" preparado para ${recipients
                .map((item) => item.email)
                .join(', ')}.`);
            return { delivered: false, provider: 'log-only' };
        }
        await transporter.sendMail({
            from: `"${fromName}" <${fromEmail}>`,
            to: recipients.map((item) => (item.name ? `"${item.name}" <${item.email}>` : item.email)).join(', '),
            subject: options.subject,
            html: options.html,
            text: options.text,
        });
        return { delivered: true, provider: 'smtp' };
    }
    async getTransporter() {
        if (!this.transporterPromise) {
            this.transporterPromise = this.createTransporter();
        }
        return this.transporterPromise;
    }
    async createTransporter() {
        const host = this.configService.get('SMTP_HOST');
        if (!host) {
            return null;
        }
        const port = Number(this.configService.get('SMTP_PORT', '587'));
        const secure = String(this.configService.get('SMTP_SECURE', 'false')).toLowerCase() === 'true';
        const user = this.configService.get('SMTP_USER');
        const pass = this.configService.get('SMTP_PASS');
        return nodemailer.createTransport({
            host,
            port,
            secure,
            auth: user && pass ? { user, pass } : undefined,
        });
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = EmailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], EmailService);
