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
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { VehiclesQueryDto } from './dto/vehicles-query.dto';
import { VehiclesService } from './vehicles.service';

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
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateVehicleDto) {
    return this.vehiclesService.create(dto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar veiculo' })
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateVehicleDto,
  ) {
    return this.vehiclesService.update(id, dto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remover veiculo' })
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.vehiclesService.remove(id);
  }
}
