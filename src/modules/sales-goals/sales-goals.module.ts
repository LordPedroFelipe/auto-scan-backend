import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SaleClosureEntity } from '../sales/entities/sale-closure.entity';
import { ShopEntity } from '../shops/entities/shop.entity';
import { UserEntity } from '../users/entities/user.entity';
import { SalesGoalsController } from './sales-goals.controller';
import { SalesGoalsScheduler } from './schedulers/sales-goals.scheduler';
import { SalesGoalsService } from './sales-goals.service';
import { SalesGoalEntity } from './entities/sales-goal.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SalesGoalEntity,
      ShopEntity,
      UserEntity,
      SaleClosureEntity,
    ]),
  ],
  controllers: [SalesGoalsController],
  providers: [SalesGoalsService, SalesGoalsScheduler],
  exports: [SalesGoalsService],
})
export class SalesGoalsModule {}