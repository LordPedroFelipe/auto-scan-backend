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
import { CreateSaleClosureDto } from './dto/create-sale-closure.dto';
import { SaleClosuresQueryDto } from './dto/sale-closures-query.dto';
import { UpdateSaleClosureDto } from './dto/update-sale-closure.dto';
import { SalesService } from './sales.service';

@ApiTags('Sales')
@Controller('Sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @ApiOperation({ summary: 'Listar fechamentos e vendas' })
  @Get()
  findAll(@Query() query: SaleClosuresQueryDto) {
    return this.salesService.findAll(query);
  }

  @ApiOperation({ summary: 'Listar opções dos campos de fechamento' })
  @Get('options')
  getOptions() {
    return this.salesService.getOptions();
  }

  @ApiOperation({ summary: 'Obter um fechamento por ID' })
  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.salesService.findOne(id);
  }

  @ApiOperation({ summary: 'Criar fechamento de lead' })
  @Post()
  create(@Body() dto: CreateSaleClosureDto) {
    return this.salesService.create(dto);
  }

  @ApiOperation({ summary: 'Atualizar fechamento de lead' })
  @Put(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateSaleClosureDto,
  ) {
    return this.salesService.update(id, dto);
  }

  @ApiOperation({ summary: 'Remover fechamento de lead' })
  @Delete(':id')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.salesService.remove(id);
  }
}
