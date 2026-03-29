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
import { CreateTestDriveDto } from './dto/create-test-drive.dto';
import { TestDrivesQueryDto } from './dto/test-drives-query.dto';
import { UpdateTestDriveDto } from './dto/update-test-drive.dto';
import { TestDrivesService } from './test-drives.service';

@ApiTags('TestDrives')
@Controller('TestDrives')
export class TestDrivesController {
  constructor(private readonly testDrivesService: TestDrivesService) {}

  @ApiOperation({ summary: 'Listar agendamentos de test drive' })
  @Get()
  findAll(@Query() query: TestDrivesQueryDto) {
    return this.testDrivesService.findAll(query);
  }

  @ApiOperation({ summary: 'Obter um test drive por ID' })
  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.testDrivesService.findOne(id);
  }

  @ApiOperation({ summary: 'Criar agendamento de test drive' })
  @Post()
  create(@Body() dto: CreateTestDriveDto) {
    return this.testDrivesService.create(dto);
  }

  @ApiOperation({ summary: 'Atualizar agendamento de test drive' })
  @Put(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateTestDriveDto,
  ) {
    return this.testDrivesService.update(id, dto);
  }

  @ApiOperation({ summary: 'Remover agendamento de test drive' })
  @Delete(':id')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.testDrivesService.remove(id);
  }
}
