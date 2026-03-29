import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeadEntity } from '../leads/entities/lead.entity';
import { ShopEntity } from '../shops/entities/shop.entity';
import { VehicleEntity } from '../vehicles/entities/vehicle.entity';
import { TestDriveEntity } from './entities/test-drive.entity';
import { TestDrivesController } from './test-drives.controller';
import { TestDrivesService } from './test-drives.service';

@Module({
  imports: [TypeOrmModule.forFeature([TestDriveEntity, ShopEntity, VehicleEntity, LeadEntity])],
  controllers: [TestDrivesController],
  providers: [TestDrivesService],
  exports: [TestDrivesService],
})
export class TestDrivesModule {}
