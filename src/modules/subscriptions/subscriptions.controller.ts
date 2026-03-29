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
import { CreateSubscriptionPaymentDto } from './dto/create-subscription-payment.dto';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { SubscriptionPaymentsQueryDto } from './dto/subscription-payments-query.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { SubscriptionsService } from './subscriptions.service';

@Controller()
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get('Subscriptions')
  listSubscriptions(@Query() query: SubscriptionPaymentsQueryDto) {
    return this.subscriptionsService.listSubscriptions(query);
  }

  @Get('Subscriptions/:id')
  getSubscription(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.subscriptionsService.getSubscription(id);
  }

  @Post('Subscriptions')
  createSubscription(@Body() dto: CreateSubscriptionDto) {
    return this.subscriptionsService.createSubscription(dto);
  }

  @Put('Subscriptions/:id')
  updateSubscription(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateSubscriptionDto,
  ) {
    return this.subscriptionsService.updateSubscription(id, dto);
  }

  @Delete('Subscriptions/:id')
  removeSubscription(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.subscriptionsService.removeSubscription(id);
  }

  @Get('SubscriptionPayments')
  listPayments(@Query() query: SubscriptionPaymentsQueryDto) {
    return this.subscriptionsService.listPayments(query);
  }

  @Get('SubscriptionPayments/shop/:shopId')
  listPaymentsByShop(
    @Param('shopId', new ParseUUIDPipe()) shopId: string,
    @Query() query: SubscriptionPaymentsQueryDto,
  ) {
    return this.subscriptionsService.listPayments(query, shopId);
  }

  @Post('SubscriptionPayments/shop/:shopId/subscription/:subscriptionId')
  createPayment(
    @Param('shopId', new ParseUUIDPipe()) shopId: string,
    @Param('subscriptionId', new ParseUUIDPipe()) subscriptionId: string,
    @Body() dto: CreateSubscriptionPaymentDto,
  ) {
    return this.subscriptionsService.createPayment(shopId, subscriptionId, dto);
  }
}
