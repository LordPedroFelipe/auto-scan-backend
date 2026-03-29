import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ReportsService } from './reports.service';

@ApiTags('Reports')
@Controller('Reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @ApiOperation({ summary: 'Gerar relatorio consolidado de uma loja' })
  @Get('shops/:shopId')
  shopReport(
    @Param('shopId', new ParseUUIDPipe()) shopId: string,
    @Query() query: Record<string, string>,
  ) {
    return this.reportsService.shopReport(shopId, query);
  }
}
