import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShopEntity } from '../shops/entities/shop.entity';
import { VehicleEntity } from '../vehicles/entities/vehicle.entity';
import { InventorySyncLogEntity } from './entities/inventory-sync-log.entity';
import { QrCodeModule } from '../qrcode/qrcode.module';
import { InventorySyncBootstrap } from './inventory-sync.bootstrap';
import { InventorySyncController } from './inventory-sync.controller';
import { InventorySyncService } from './inventory-sync.service';

@Module({
  imports: [TypeOrmModule.forFeature([ShopEntity, VehicleEntity, InventorySyncLogEntity]), QrCodeModule],
  controllers: [InventorySyncController],
  providers: [InventorySyncService, InventorySyncBootstrap],
  exports: [InventorySyncService],
})
export class InventorySyncModule {}

