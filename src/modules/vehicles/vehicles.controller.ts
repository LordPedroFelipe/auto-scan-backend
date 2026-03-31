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
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { extname, join } from 'path';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { VehiclesQueryDto } from './dto/vehicles-query.dto';
import { VehiclesService } from './vehicles.service';

const { diskStorage } = require('multer');
const uploadDirectory = join(process.cwd(), 'uploads', 'vehicles');
type UploadedVehicleFile = { filename: string; originalname: string };

const vehicleStorage = diskStorage({
  destination: uploadDirectory,
  filename: (
    _request: unknown,
    file: UploadedVehicleFile,
    callback: (error: Error | null, filename: string) => void,
  ) => {
    const extension = extname(file.originalname || '').toLowerCase();
    const suffix = `${Date.now()}-${Math.round(Math.random() * 1_000_000_000)}`;
    const baseName = (file.originalname || 'vehicle')
      .replace(extension, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60);

    callback(null, `${baseName || 'vehicle'}-${suffix}${extension || '.webp'}`);
  },
});

@ApiTags('Vehicles')
@Controller('Vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @ApiOperation({ summary: 'Listar veiculos com filtros comerciais' })
  @Get()
  findAll(@Query() query: VehiclesQueryDto) {
    return this.vehiclesService.findAll(query);
  }

  @ApiOperation({ summary: 'Listar veiculos em formato simplificado para selects' })
  @Get('list-items')
  listItems() {
    return this.vehiclesService.listItems();
  }

  @ApiOperation({ summary: 'Obter detalhes de um veiculo' })
  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.vehiclesService.findOne(id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar veiculo' })
  @ApiConsumes('multipart/form-data')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FilesInterceptor('images', 20, {
      storage: vehicleStorage,
    }),
  )
  @Post()
  create(
    @Body() dto: CreateVehicleDto,
    @UploadedFiles() files: UploadedVehicleFile[],
    @Req() request: Request,
  ) {
    return this.vehiclesService.create(dto, files ?? [], request);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar veiculo' })
  @ApiConsumes('multipart/form-data')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FilesInterceptor('images', 20, {
      storage: vehicleStorage,
    }),
  )
  @Put(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateVehicleDto,
    @UploadedFiles() files: UploadedVehicleFile[],
    @Req() request: Request,
  ) {
    return this.vehiclesService.update(id, dto, files ?? [], request);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remover veiculo' })
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.vehiclesService.remove(id);
  }
}
