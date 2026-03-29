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
import { CreateLeadNoteDto } from './dto/create-lead-note.dto';
import { LeadNotesQueryDto } from './dto/lead-notes-query.dto';
import { UpdateLeadNoteDto } from './dto/update-lead-note.dto';
import { LeadNotesService } from './lead-notes.service';

@ApiTags('LeadNotes')
@Controller('LeadNotes')
export class LeadNotesController {
  constructor(private readonly leadNotesService: LeadNotesService) {}

  @ApiOperation({ summary: 'Listar anotacoes de lead' })
  @Get()
  findAll(@Query() query: LeadNotesQueryDto) {
    return this.leadNotesService.findAll(query);
  }

  @ApiOperation({ summary: 'Listar tipos disponiveis de anotacao' })
  @Get('types')
  types() {
    return this.leadNotesService.listTypes();
  }

  @ApiOperation({ summary: 'Listar anotacoes de um lead especifico' })
  @Get('lead/:leadId')
  findByLead(
    @Param('leadId', new ParseUUIDPipe()) leadId: string,
    @Query() query: LeadNotesQueryDto,
  ) {
    return this.leadNotesService.findByLead(leadId, query);
  }

  @ApiOperation({ summary: 'Obter anotacao por ID' })
  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.leadNotesService.findOne(id);
  }

  @ApiOperation({ summary: 'Criar anotacao de lead' })
  @Post()
  create(@Body() dto: CreateLeadNoteDto) {
    return this.leadNotesService.create(dto);
  }

  @ApiOperation({ summary: 'Atualizar anotacao de lead' })
  @Put(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateLeadNoteDto,
  ) {
    return this.leadNotesService.update(id, dto);
  }

  @ApiOperation({ summary: 'Remover anotacao de lead' })
  @Delete(':id')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.leadNotesService.remove(id);
  }
}
