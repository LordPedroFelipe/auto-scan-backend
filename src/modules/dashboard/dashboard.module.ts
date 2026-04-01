import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatSessionEntity } from '../chat/entities/chat-session.entity';
import { ChatTelemetryEventEntity } from '../chat/entities/chat-telemetry-event.entity';
import { InventorySyncLogEntity } from '../inventory-sync/entities/inventory-sync-log.entity';
import { LeadEntity } from '../leads/entities/lead.entity';
import { ShopEntity } from '../shops/entities/shop.entity';
import { SaleClosureEntity } from '../sales/entities/sale-closure.entity';
import { TestDriveEntity } from '../test-drives/entities/test-drive.entity';
import { UserEntity } from '../users/entities/user.entity';
import { VehicleEntity } from '../vehicles/entities/vehicle.entity';
import { SalesGoalsModule } from '../sales-goals/sales-goals.module';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ShopEntity,
      VehicleEntity,
      LeadEntity,
      SaleClosureEntity,
      TestDriveEntity,
      UserEntity,
      InventorySyncLogEntity,
      ChatSessionEntity,
      ChatTelemetryEventEntity,
    ]),
    SalesGoalsModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
