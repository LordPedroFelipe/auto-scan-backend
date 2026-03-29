import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShopEntity } from '../shops/entities/shop.entity';
import { SubscriptionPaymentEntity } from '../subscriptions/entities/subscription-payment.entity';
import { SubscriptionEntity } from '../subscriptions/entities/subscription.entity';
import { UserEntity } from '../users/entities/user.entity';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([
      ShopEntity,
      UserEntity,
      SubscriptionEntity,
      SubscriptionPaymentEntity,
    ]),
  ],
  controllers: [SettingsController],
  providers: [SettingsService],
})
export class SettingsModule {}
