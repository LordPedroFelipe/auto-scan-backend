import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Put,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateLeadDto } from './dto/create-lead.dto';
import { LeadsQueryDto } from './dto/leads-query.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { LeadsService } from './leads.service';

@ApiTags('Leads')
@Controller('Lead')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @ApiOperation({ summary: 'Listar leads com filtros' })
  @Get()
  findAll(@Query() query: LeadsQueryDto) {
    return this.leadsService.findAll(query);
  }

  @ApiOperation({ summary: 'Listar status disponiveis para leads' })
  @Get('status')
  statuses() {
    return this.leadsService.listStatuses();
  }

  @ApiOperation({ summary: 'Obter um lead por ID' })
  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.leadsService.findOne(id);
  }

  @ApiOperation({ summary: 'Criar lead' })
  @Post()
  create(@Body() dto: CreateLeadDto) {
    return this.leadsService.create(dto);
  }

  @ApiOperation({ summary: 'Atualizar lead' })
  @Put(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateLeadDto,
  ) {
    return this.leadsService.update(id, dto);
  }

  @ApiOperation({ summary: 'Remover lead' })
  @Delete(':id')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.leadsService.remove(id);
  }
}
