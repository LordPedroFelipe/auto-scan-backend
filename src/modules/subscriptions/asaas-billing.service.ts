import { BadGatewayException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ShopEntity } from '../shops/entities/shop.entity';

type AsaasCustomerResponse = {
  id: string;
};

type AsaasPaymentResponse = {
  id: string;
  customer?: string;
  status?: string;
  invoiceUrl?: string;
  bankSlipUrl?: string;
  dueDate?: string;
  paymentDate?: string;
  billingType?: string;
  externalReference?: string;
  description?: string;
  value?: number;
  transactionReceiptUrl?: string;
  pixTransaction?: {
    encodedImage?: string;
    payload?: string;
  };
};

@Injectable()
export class AsaasBillingService {
  private readonly apiKey: string | null;
  private readonly baseUrl: string;
  private readonly timeoutMs: number;

  constructor(private readonly configService: ConfigService) {
    this.apiKey =
      this.readFirstDefined(['ASAAS_API_KEY', 'ASAAS_ACCESS_TOKEN']) ?? null;
    this.baseUrl =
      this.readFirstDefined(['ASAAS_BASE_URL']) ??
      'https://sandbox.asaas.com/api/v3';
    this.timeoutMs = Number(this.configService.get<string>('ASAAS_TIMEOUT_MS', '15000'));
  }

  isConfigured() {
    return Boolean(this.apiKey && this.baseUrl);
  }

  async ensureCustomer(shop: ShopEntity) {
    if (!this.isConfigured()) {
      throw new InternalServerErrorException(
        'Asaas nao esta configurado para operar cobranca em producao.',
      );
    }

    if (shop.billingCustomerProvider === 'asaas' && shop.billingCustomerExternalId) {
      return {
        provider: 'asaas',
        customerId: shop.billingCustomerExternalId,
      };
    }

    const customer = await this.request<AsaasCustomerResponse>('POST', '/customers', {
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

  async createSubscriptionCharge(input: {
    customerId: string;
    amount: number;
    billingType: string;
    dueDate: string;
    description: string;
    externalReference: string;
  }) {
    return this.request<AsaasPaymentResponse>('POST', '/payments', {
      customer: input.customerId,
      billingType: input.billingType,
      value: input.amount,
      dueDate: input.dueDate,
      description: input.description,
      externalReference: input.externalReference,
    });
  }

  async getPayment(paymentId: string) {
    return this.request<AsaasPaymentResponse>('GET', `/payments/${paymentId}`);
  }

  private async request<T>(
    method: 'GET' | 'POST',
    path: string,
    body?: Record<string, unknown>,
  ): Promise<T> {
    if (!this.apiKey) {
      throw new InternalServerErrorException('ASAAS_API_KEY nao configurada.');
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

      const json = (await response.json().catch(() => ({}))) as Record<string, unknown>;

      if (!response.ok) {
        throw new BadGatewayException(
          `Falha ao comunicar com o Asaas: ${String(json.errors ?? json.message ?? response.statusText)}`,
        );
      }

      return json as T;
    } catch (error) {
      if (error instanceof BadGatewayException || error instanceof InternalServerErrorException) {
        throw error;
      }

      throw new BadGatewayException('Falha de comunicacao com o Asaas.');
    } finally {
      clearTimeout(timeout);
    }
  }

  private readFirstDefined(keys: string[]) {
    for (const key of keys) {
      const value = this.configService.get<string>(key);
      if (value && value.trim()) {
        return value.trim();
      }
    }

    return null;
  }
}
