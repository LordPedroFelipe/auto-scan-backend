import { Controller, Get, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { InventorySyncService } from './inventory-sync.service';

@ApiTags('InventorySync')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('InventorySync')
export class InventorySyncController {
  constructor(private readonly inventorySyncService: InventorySyncService) {}

  @Post('shops/:shopId/run')
  runShop(@Param('shopId', new ParseUUIDPipe()) shopId: string) {
    return this.inventorySyncService.syncShopInventory(shopId);
  }

  @Post('run-enabled')
  runEnabled() {
    return this.inventorySyncService.syncEnabledShops();
  }

  @Get('shops/:shopId/status')
  getStatus(@Param('shopId', new ParseUUIDPipe()) shopId: string) {
    return this.inventorySyncService.getShopSyncStatus(shopId);
  }
}
