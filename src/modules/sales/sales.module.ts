import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeadEntity } from '../leads/entities/lead.entity';
import { ShopEntity } from '../shops/entities/shop.entity';
import { TestDriveEntity } from '../test-drives/entities/test-drive.entity';
import { UserEntity } from '../users/entities/user.entity';
import { VehicleEntity } from '../vehicles/entities/vehicle.entity';
import { SalesController } from './sales.controller';
import { SalesService } from './sales.service';
import { SaleClosureEntity } from './entities/sale-closure.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SaleClosureEntity,
      LeadEntity,
      ShopEntity,
      VehicleEntity,
      UserEntity,
      TestDriveEntity,
    ]),
  ],
  controllers: [SalesController],
  providers: [SalesService],
  exports: [SalesService],
})
export class SalesModule {}
