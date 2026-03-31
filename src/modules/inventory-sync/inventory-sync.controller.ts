import { Controller, Get, Param, ParseUUIDPipe, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { JwtUser } from '../auth/jwt-user.interface';
import { InventorySyncLogsQueryDto } from './dto/inventory-sync-logs-query.dto';
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
    return this.inventorySyncService.syncShopInventory(shopId, { triggerType: 'manual' });
  }

  @ApiOperation({ summary: 'Executar sincronizacao de todas as lojas habilitadas' })
  @Post('run-enabled')
  runEnabled() {
    return this.inventorySyncService.syncEnabledShops('bulk');
  }

  @ApiOperation({ summary: 'Consultar status de sincronizacao de uma loja' })
  @Get('shops/:shopId/status')
  getStatus(@Param('shopId', new ParseUUIDPipe()) shopId: string) {
    return this.inventorySyncService.getShopSyncStatus(shopId);
  }

  @ApiOperation({ summary: 'Listar logs de integracoes de estoque' })
  @Get('logs')
  listLogs(@Query() query: InventorySyncLogsQueryDto, @CurrentUser() user: JwtUser) {
    return this.inventorySyncService.listLogs(query, user);
  }

  @ApiOperation({ summary: 'Obter detalhes de um log de integracao' })
  @Get('logs/:logId')
  getLogById(@Param('logId', new ParseUUIDPipe()) logId: string, @CurrentUser() user: JwtUser) {
    return this.inventorySyncService.getLogById(logId, user);
  }
}
