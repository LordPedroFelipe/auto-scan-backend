import { Body, Controller, Get, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SettingsOverviewQueryDto } from './dto/settings-overview-query.dto';
import { ShopSettingsQueryDto } from './dto/shop-settings-query.dto';
import { UpdateNotificationPreferencesDto } from './dto/update-notification-preferences.dto';
import { UpdateShopPreferencesDto } from './dto/update-shop-preferences.dto';
import { SettingsService } from './settings.service';

@ApiTags('Settings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('Settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @ApiOperation({ summary: 'Obter overview consolidado de configuracoes e cobranca' })
  @Get('overview')
  getOverview(@Query() query: SettingsOverviewQueryDto) {
    return this.settingsService.getOverview(query.shopId);
  }

  @ApiOperation({ summary: 'Obter preferencias operacionais da loja' })
  @Get('preferences')
  getShopPreferences(@Query() query: ShopSettingsQueryDto) {
    return this.settingsService.getShopPreferences(query.shopId);
  }

  @ApiOperation({ summary: 'Salvar preferencias operacionais da loja' })
  @Put('preferences')
  updateShopPreferences(@Body() body: UpdateShopPreferencesDto) {
    return this.settingsService.updateShopPreferences(body.shopId, body.preferences);
  }

  @ApiOperation({ summary: 'Obter preferencias de notificacao da loja' })
  @Get('notifications')
  getNotificationPreferences(@Query() query: ShopSettingsQueryDto) {
    return this.settingsService.getNotificationPreferences(query.shopId);
  }

  @ApiOperation({ summary: 'Salvar preferencias de notificacao da loja' })
  @Put('notifications')
  updateNotificationPreferences(@Body() body: UpdateNotificationPreferencesDto) {
    return this.settingsService.updateNotificationPreferences(body.shopId, body.preferences);
  }
}
