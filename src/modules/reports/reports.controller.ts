import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ReportsService } from './reports.service';

@Controller('Reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('shops/:shopId')
  shopReport(
    @Param('shopId', new ParseUUIDPipe()) shopId: string,
    @Query() query: Record<string, string>,
  ) {
    return this.reportsService.shopReport(shopId, query);
  }
}
