import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeadNoteEntity } from '../lead-notes/entities/lead-note.entity';
import { SaleClosureEntity } from '../sales/entities/sale-closure.entity';
import { ShopEntity } from '../shops/entities/shop.entity';
import { TestDriveEntity } from '../test-drives/entities/test-drive.entity';
import { UserEntity } from '../users/entities/user.entity';
import { VehicleEntity } from '../vehicles/entities/vehicle.entity';
import { LeadEntity } from './entities/lead.entity';
import { LeadsController } from './leads.controller';
import { LeadsService } from './leads.service';

@Module({
  imports: [TypeOrmModule.forFeature([LeadEntity, ShopEntity, VehicleEntity, UserEntity, LeadNoteEntity, TestDriveEntity, SaleClosureEntity])],
  controllers: [LeadsController],
  providers: [LeadsService],
  exports: [LeadsService],
})
export class LeadsModule {}
