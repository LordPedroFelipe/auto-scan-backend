import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { JwtUser } from '../auth/jwt-user.interface';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('Dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @ApiOperation({ summary: 'Obter resumo do dashboard apropriado para o papel do usuario autenticado' })
  @Get('home')
  home(
    @CurrentUser() user: JwtUser,
    @Query('periodDays') periodDays?: string,
    @Query('sellerId') sellerId?: string,
    @Query('leadOrigin') leadOrigin?: string,
  ) {
    return this.dashboardService.getDashboardForUser(user, periodDays, sellerId, leadOrigin);
  }

  @ApiOperation({ summary: 'Obter dashboard global do admin do sistema' })
  @Get('system')
  system(@CurrentUser() user: JwtUser, @Query('periodDays') periodDays?: string) {
    return this.dashboardService.getSystemDashboard(user, periodDays);
  }

  @ApiOperation({ summary: 'Obter dashboard operacional da loja' })
  @Get('shop')
  shop(
    @CurrentUser() user: JwtUser,
    @Query('periodDays') periodDays?: string,
    @Query('sellerId') sellerId?: string,
    @Query('leadOrigin') leadOrigin?: string,
  ) {
    return this.dashboardService.getShopDashboard(user, periodDays, sellerId, leadOrigin);
  }

  @ApiOperation({ summary: 'Obter dashboard pessoal do vendedor' })
  @Get('seller')
  seller(@CurrentUser() user: JwtUser, @Query('periodDays') periodDays?: string) {
    return this.dashboardService.getSellerDashboard(user, periodDays);
  }
}
