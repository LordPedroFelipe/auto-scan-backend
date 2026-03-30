import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AsaasWebhookDto } from './dto/asaas-webhook.dto';
import { CreateBillingCheckoutDto } from './dto/create-billing-checkout.dto';
import { CreateSubscriptionPaymentDto } from './dto/create-subscription-payment.dto';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { SubscriptionPaymentsQueryDto } from './dto/subscription-payments-query.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { SubscriptionsService } from './subscriptions.service';

@ApiTags('Subscriptions')
@Controller()
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar planos de assinatura' })
  @UseGuards(JwtAuthGuard)
  @Get('Subscriptions')
  listSubscriptions(@Query() query: SubscriptionPaymentsQueryDto) {
    return this.subscriptionsService.listSubscriptions(query);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obter detalhes de um plano' })
  @UseGuards(JwtAuthGuard)
  @Get('Subscriptions/:id')
  getSubscription(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.subscriptionsService.getSubscription(id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar plano de assinatura' })
  @UseGuards(JwtAuthGuard)
  @Post('Subscriptions')
  createSubscription(@Body() dto: CreateSubscriptionDto) {
    return this.subscriptionsService.createSubscription(dto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar plano de assinatura' })
  @UseGuards(JwtAuthGuard)
  @Put('Subscriptions/:id')
  updateSubscription(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateSubscriptionDto,
  ) {
    return this.subscriptionsService.updateSubscription(id, dto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remover plano de assinatura' })
  @UseGuards(JwtAuthGuard)
  @Delete('Subscriptions/:id')
  removeSubscription(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.subscriptionsService.removeSubscription(id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar pagamentos de assinatura' })
  @UseGuards(JwtAuthGuard)
  @Get('SubscriptionPayments')
  listPayments(@Query() query: SubscriptionPaymentsQueryDto) {
    return this.subscriptionsService.listPayments(query);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar pagamentos de uma loja especifica' })
  @UseGuards(JwtAuthGuard)
  @Get('SubscriptionPayments/shop/:shopId')
  listPaymentsByShop(
    @Param('shopId', new ParseUUIDPipe()) shopId: string,
    @Query() query: SubscriptionPaymentsQueryDto,
  ) {
    return this.subscriptionsService.listPayments(query, shopId);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar pagamento para uma assinatura de loja' })
  @UseGuards(JwtAuthGuard)
  @Post('SubscriptionPayments/shop/:shopId/subscription/:subscriptionId')
  createPayment(
    @Param('shopId', new ParseUUIDPipe()) shopId: string,
    @Param('subscriptionId', new ParseUUIDPipe()) subscriptionId: string,
    @Body() dto: CreateSubscriptionPaymentDto,
  ) {
    return this.subscriptionsService.createPayment(shopId, subscriptionId, dto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Gerar checkout de cobranca no Asaas para uma assinatura de loja' })
  @UseGuards(JwtAuthGuard)
  @Post('SubscriptionPayments/shop/:shopId/subscription/:subscriptionId/checkout')
  createCheckout(
    @Param('shopId', new ParseUUIDPipe()) shopId: string,
    @Param('subscriptionId', new ParseUUIDPipe()) subscriptionId: string,
    @Body() dto: CreateBillingCheckoutDto,
  ) {
    return this.subscriptionsService.createCheckout(shopId, subscriptionId, dto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Sincronizar status de um pagamento com o provedor' })
  @UseGuards(JwtAuthGuard)
  @Post('SubscriptionPayments/:id/sync')
  syncPayment(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.subscriptionsService.syncPaymentStatus(id);
  }

  @ApiOperation({ summary: 'Receber webhooks do Asaas para conciliacao de cobranca' })
  @Post('Billing/webhooks/asaas')
  handleAsaasWebhook(
    @Body() body: AsaasWebhookDto,
    @Headers('asaas-access-token') token?: string,
  ) {
    return this.subscriptionsService.processAsaasWebhook(body, token);
  }
}
