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
import { CreateLeadNoteDto } from './dto/create-lead-note.dto';
import { LeadNotesQueryDto } from './dto/lead-notes-query.dto';
import { UpdateLeadNoteDto } from './dto/update-lead-note.dto';
import { LeadNotesService } from './lead-notes.service';

@Controller('LeadNotes')
export class LeadNotesController {
  constructor(private readonly leadNotesService: LeadNotesService) {}

  @Get()
  findAll(@Query() query: LeadNotesQueryDto) {
    return this.leadNotesService.findAll(query);
  }

  @Get('types')
  types() {
    return this.leadNotesService.listTypes();
  }

  @Get('lead/:leadId')
  findByLead(
    @Param('leadId', new ParseUUIDPipe()) leadId: string,
    @Query() query: LeadNotesQueryDto,
  ) {
    return this.leadNotesService.findByLead(leadId, query);
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.leadNotesService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateLeadNoteDto) {
    return this.leadNotesService.create(dto);
  }

  @Put(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateLeadNoteDto,
  ) {
    return this.leadNotesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.leadNotesService.remove(id);
  }
}
