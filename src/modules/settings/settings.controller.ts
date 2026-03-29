import { Controller, Get, Query } from '@nestjs/common';
import { SettingsOverviewQueryDto } from './dto/settings-overview-query.dto';
import { SettingsService } from './settings.service';

@Controller('Settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('overview')
  getOverview(@Query() query: SettingsOverviewQueryDto) {
    return this.settingsService.getOverview(query.shopId);
  }
}
