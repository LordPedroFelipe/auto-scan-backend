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
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateShopDto } from './dto/create-shop.dto';
import { CreateShopOnboardingDto } from './dto/create-shop-onboarding.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { ShopsService } from './shops.service';

@Controller('Shops')
export class ShopsController {
  constructor(private readonly shopsService: ShopsService) {}

  @Get()
  findAll() {
    return this.shopsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.shopsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':shopId/sellers')
  listSellers(@Param('shopId', new ParseUUIDPipe()) shopId: string) {
    return this.shopsService.listSellers(shopId);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateShopDto) {
    return this.shopsService.create(dto);
  }

  @Post('onboarding')
  createOnboarding(@Body() dto: CreateShopOnboardingDto) {
    return this.shopsService.createOnboarding(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':shopId/sellers')
  addSeller(
    @Param('shopId', new ParseUUIDPipe()) shopId: string,
    @Body() body: { sellerId: string },
  ) {
    return this.shopsService.addSeller(shopId, body.sellerId);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateShopDto,
  ) {
    return this.shopsService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.shopsService.remove(id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':shopId/sellers/:sellerId')
  removeSeller(
    @Param('shopId', new ParseUUIDPipe()) shopId: string,
    @Param('sellerId', new ParseUUIDPipe()) sellerId: string,
  ) {
    return this.shopsService.removeSeller(shopId, sellerId);
  }
}
