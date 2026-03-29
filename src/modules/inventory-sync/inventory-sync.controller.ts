import { Controller, Get, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { InventorySyncService } from './inventory-sync.service';

@ApiTags('InventorySync')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('InventorySync')
export class InventorySyncController {
  constructor(private readonly inventorySyncService: InventorySyncService) {}

  @ApiOperation({ summary: 'Executar sincronizacao de estoque de uma loja' })
  @Post('shops/:shopId/run')
  runShop(@Param('shopId', new ParseUUIDPipe()) shopId: string) {
    return this.inventorySyncService.syncShopInventory(shopId);
  }

  @ApiOperation({ summary: 'Executar sincronizacao de todas as lojas habilitadas' })
  @Post('run-enabled')
  runEnabled() {
    return this.inventorySyncService.syncEnabledShops();
  }

  @ApiOperation({ summary: 'Consultar status de sincronizacao de uma loja' })
  @Get('shops/:shopId/status')
  getStatus(@Param('shopId', new ParseUUIDPipe()) shopId: string) {
    return this.inventorySyncService.getShopSyncStatus(shopId);
  }
}
