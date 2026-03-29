import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateSubscriptionPaymentDto } from './dto/create-subscription-payment.dto';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { SubscriptionPaymentsQueryDto } from './dto/subscription-payments-query.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { SubscriptionsService } from './subscriptions.service';

@ApiTags('Subscriptions')
@Controller()
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @ApiOperation({ summary: 'Listar planos de assinatura' })
  @Get('Subscriptions')
  listSubscriptions(@Query() query: SubscriptionPaymentsQueryDto) {
    return this.subscriptionsService.listSubscriptions(query);
  }

  @ApiOperation({ summary: 'Obter detalhes de um plano' })
  @Get('Subscriptions/:id')
  getSubscription(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.subscriptionsService.getSubscription(id);
  }

  @ApiOperation({ summary: 'Criar plano de assinatura' })
  @Post('Subscriptions')
  createSubscription(@Body() dto: CreateSubscriptionDto) {
    return this.subscriptionsService.createSubscription(dto);
  }

  @ApiOperation({ summary: 'Atualizar plano de assinatura' })
  @Put('Subscriptions/:id')
  updateSubscription(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateSubscriptionDto,
  ) {
    return this.subscriptionsService.updateSubscription(id, dto);
  }

  @ApiOperation({ summary: 'Remover plano de assinatura' })
  @Delete('Subscriptions/:id')
  removeSubscription(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.subscriptionsService.removeSubscription(id);
  }

  @ApiOperation({ summary: 'Listar pagamentos de assinatura' })
  @Get('SubscriptionPayments')
  listPayments(@Query() query: SubscriptionPaymentsQueryDto) {
    return this.subscriptionsService.listPayments(query);
  }

  @ApiOperation({ summary: 'Listar pagamentos de uma loja especifica' })
  @Get('SubscriptionPayments/shop/:shopId')
  listPaymentsByShop(
    @Param('shopId', new ParseUUIDPipe()) shopId: string,
    @Query() query: SubscriptionPaymentsQueryDto,
  ) {
    return this.subscriptionsService.listPayments(query, shopId);
  }

  @ApiOperation({ summary: 'Criar pagamento para uma assinatura de loja' })
  @Post('SubscriptionPayments/shop/:shopId/subscription/:subscriptionId')
  createPayment(
    @Param('shopId', new ParseUUIDPipe()) shopId: string,
    @Param('subscriptionId', new ParseUUIDPipe()) subscriptionId: string,
    @Body() dto: CreateSubscriptionPaymentDto,
  ) {
    return this.subscriptionsService.createPayment(shopId, subscriptionId, dto);
  }
}
