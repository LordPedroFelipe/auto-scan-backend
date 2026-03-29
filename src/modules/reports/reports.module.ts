import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeadEntity } from '../leads/entities/lead.entity';
import { ShopEntity } from '../shops/entities/shop.entity';
import { TestDriveEntity } from '../test-drives/entities/test-drive.entity';
import { VehicleEntity } from '../vehicles/entities/vehicle.entity';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

@Module({
  imports: [TypeOrmModule.forFeature([ShopEntity, VehicleEntity, LeadEntity, TestDriveEntity])],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
