import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateShopDto } from './dto/create-shop.dto';
import { CreateShopOnboardingDto } from './dto/create-shop-onboarding.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { ShopsService } from './shops.service';

@ApiTags('Shops')
@Controller('Shops')
export class ShopsController {
  constructor(private readonly shopsService: ShopsService) {}

  @ApiOperation({ summary: 'Listar lojas' })
  @Get()
  findAll() {
    return this.shopsService.findAll();
  }

  @ApiOperation({ summary: 'Obter detalhes de uma loja' })
  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.shopsService.findOne(id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar vendedores vinculados a uma loja' })
  @UseGuards(JwtAuthGuard)
  @Get(':shopId/sellers')
  listSellers(@Param('shopId', new ParseUUIDPipe()) shopId: string) {
    return this.shopsService.listSellers(shopId);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar loja' })
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateShopDto) {
    return this.shopsService.create(dto);
  }

  @ApiOperation({ summary: 'Criar loja e usuario master no fluxo de onboarding' })
  @Post('onboarding')
  createOnboarding(@Body() dto: CreateShopOnboardingDto) {
    return this.shopsService.createOnboarding(dto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Vincular vendedor a uma loja' })
  @ApiBody({ schema: { type: 'object', properties: { sellerId: { type: 'string', format: 'uuid' } }, required: ['sellerId'] } })
  @UseGuards(JwtAuthGuard)
  @Post(':shopId/sellers')
  addSeller(
    @Param('shopId', new ParseUUIDPipe()) shopId: string,
    @Body() body: { sellerId: string },
  ) {
    return this.shopsService.addSeller(shopId, body.sellerId);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar loja' })
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateShopDto,
  ) {
    return this.shopsService.update(id, dto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Inativar loja' })
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.shopsService.remove(id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remover vendedor da loja' })
  @UseGuards(JwtAuthGuard)
  @Delete(':shopId/sellers/:sellerId')
  removeSeller(
    @Param('shopId', new ParseUUIDPipe()) shopId: string,
    @Param('sellerId', new ParseUUIDPipe()) sellerId: string,
  ) {
    return this.shopsService.removeSeller(shopId, sellerId);
  }
}
