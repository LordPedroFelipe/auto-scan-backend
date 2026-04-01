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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AsaasBillingService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let AsaasBillingService = class AsaasBillingService {
    constructor(configService) {
        this.configService = configService;
        this.apiKey =
            this.readFirstDefined(['ASAAS_API_KEY', 'ASAAS_ACCESS_TOKEN']) ?? null;
        this.baseUrl =
            this.readFirstDefined(['ASAAS_BASE_URL']) ??
                'https://sandbox.asaas.com/api/v3';
        this.timeoutMs = Number(this.configService.get('ASAAS_TIMEOUT_MS', '15000'));
    }
    isConfigured() {
        return Boolean(this.apiKey && this.baseUrl);
    }
    async ensureCustomer(shop) {
        if (!this.isConfigured()) {
            throw new common_1.InternalServerErrorException('Asaas nao esta configurado para operar cobranca em producao.');
        }
        if (shop.billingCustomerProvider === 'asaas' && shop.billingCustomerExternalId) {
            return {
                provider: 'asaas',
                customerId: shop.billingCustomerExternalId,
            };
        }
        const customer = await this.request('POST', '/customers', {
            name: shop.name,
            email: shop.email ?? undefined,
            mobilePhone: shop.phoneNumber ?? undefined,
            cpfCnpj: shop.cnpj ?? undefined,
            address: shop.addressLine ?? undefined,
            province: shop.city ?? undefined,
            postalCode: shop.zipCode ?? undefined,
            externalReference: shop.id,
            notificationDisabled: false,
        });
        return {
            provider: 'asaas',
            customerId: customer.id,
        };
    }
    async createSubscriptionCharge(input) {
        return this.request('POST', '/payments', {
            customer: input.customerId,
            billingType: input.billingType,
            value: input.amount,
            dueDate: input.dueDate,
            description: input.description,
            externalReference: input.externalReference,
        });
    }
    async getPayment(paymentId) {
        return this.request('GET', `/payments/${paymentId}`);
    }
    async request(method, path, body) {
        if (!this.apiKey) {
            throw new common_1.InternalServerErrorException('ASAAS_API_KEY nao configurada.');
        }
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
        try {
            const response = await fetch(`${this.baseUrl}${path}`, {
                method,
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    access_token: this.apiKey,
                },
                body: body ? JSON.stringify(body) : undefined,
                signal: controller.signal,
            });
            const json = (await response.json().catch(() => ({})));
            if (!response.ok) {
                throw new common_1.BadGatewayException(`Falha ao comunicar com o Asaas: ${String(json.errors ?? json.message ?? response.statusText)}`);
            }
            return json;
        }
        catch (error) {
            if (error instanceof common_1.BadGatewayException || error instanceof common_1.InternalServerErrorException) {
                throw error;
            }
            throw new common_1.BadGatewayException('Falha de comunicacao com o Asaas.');
        }
        finally {
            clearTimeout(timeout);
        }
    }
    readFirstDefined(keys) {
        for (const key of keys) {
            const value = this.configService.get(key);
            if (value && value.trim()) {
                return value.trim();
            }
        }
        return null;
    }
};
exports.AsaasBillingService = AsaasBillingService;
exports.AsaasBillingService = AsaasBillingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], AsaasBillingService);
