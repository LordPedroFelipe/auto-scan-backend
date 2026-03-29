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
import { CreateTestDriveDto } from './dto/create-test-drive.dto';
import { TestDrivesQueryDto } from './dto/test-drives-query.dto';
import { UpdateTestDriveDto } from './dto/update-test-drive.dto';
import { TestDrivesService } from './test-drives.service';

@Controller('TestDrives')
export class TestDrivesController {
  constructor(private readonly testDrivesService: TestDrivesService) {}

  @Get()
  findAll(@Query() query: TestDrivesQueryDto) {
    return this.testDrivesService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.testDrivesService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateTestDriveDto) {
    return this.testDrivesService.create(dto);
  }

  @Put(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateTestDriveDto,
  ) {
    return this.testDrivesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.testDrivesService.remove(id);
  }
}
