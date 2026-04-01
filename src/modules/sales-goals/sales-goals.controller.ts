import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtUser } from '../auth/jwt-user.interface';
import { CurrentUser } from '../auth/current-user.decorator';
import { CreateSalesGoalDto } from './dto/create-sales-goal.dto';
import { SalesGoalsQueryDto } from './dto/create-sales-goal.dto';
import { UpdateSalesGoalDto } from './dto/create-sales-goal.dto';
import { SalesGoalsService } from './sales-goals.service';

@ApiTags('Sales Goals')
@Controller('SalesGoals')
export class SalesGoalsController {
  constructor(private readonly salesGoalsService: SalesGoalsService) {}

  @ApiOperation({ summary: 'Listar metas de vendas' })
  @Get()
  findAll(@Query() query: SalesGoalsQueryDto, @CurrentUser() user: JwtUser) {
    const shopId = user.shopId || query.shopId;
    return this.salesGoalsService.findAll(query, shopId);
  }

  @ApiOperation({ summary: 'Obter meta por ID' })
  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.salesGoalsService.findOne(id);
  }

  @ApiOperation({ summary: 'Criar meta de vendas' })
  @Post()
  create(@Body() dto: CreateSalesGoalDto, @CurrentUser() user: JwtUser) {
    const shopId = user.shopId;
    if (!shopId) {
      throw new Error('Usuário deve pertencer a uma loja');
    }
    return this.salesGoalsService.create(dto, shopId);
  }

  @ApiOperation({ summary: 'Atualizar meta de vendas' })
  @Put(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateSalesGoalDto,
  ) {
    return this.salesGoalsService.update(id, dto);
  }

  @ApiOperation({ summary: 'Excluir meta de vendas' })
  @Delete(':id')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.salesGoalsService.remove(id);
  }

  @ApiOperation({ summary: 'Obter metas com progresso' })
  @Get('progress/overview')
  getGoalsWithProgress(
    @CurrentUser() user: JwtUser,
    @Query('year') year?: string,
    @Query('month') month?: string,
  ) {
    const shopId = user.shopId;
    if (!shopId) {
      throw new Error('Usuário deve pertencer a uma loja');
    }
    return this.salesGoalsService.getGoalsWithProgress(
      shopId,
      year ? parseInt(year) : undefined,
      month ? parseInt(month) : undefined,
    );
  }

  @ApiOperation({ summary: 'Obter metas do vendedor' })
  @Get('seller/me')
  getSellerGoals(
    @CurrentUser() user: JwtUser,
    @Query('year') year?: string,
    @Query('month') month?: string,
  ) {
    return this.salesGoalsService.getSellerGoals(
      user.userId,
      year ? parseInt(year) : undefined,
      month ? parseInt(month) : undefined,
    );
  }

  @ApiOperation({ summary: 'Atualizar valores atuais das metas' })
  @Post('update-current-values')
  updateCurrentValues() {
    return this.salesGoalsService.updateCurrentValues();
  }
}