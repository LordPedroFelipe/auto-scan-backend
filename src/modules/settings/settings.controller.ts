import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SettingsOverviewQueryDto } from './dto/settings-overview-query.dto';
import { SettingsService } from './settings.service';

@ApiTags('Settings')
@Controller('Settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @ApiOperation({ summary: 'Obter overview consolidado de configuracoes e cobranca' })
  @Get('overview')
  getOverview(@Query() query: SettingsOverviewQueryDto) {
    return this.settingsService.getOverview(query.shopId);
  }
}
