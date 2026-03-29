import { Body, Controller, Get, Header, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';
import { CreateQrCodeDto } from './dto/create-qr-code.dto';
import { QrCodeQueryDto } from './dto/qr-code-query.dto';
import { QrCodeService } from './qrcode.service';

@Controller('QRCode')
export class QrCodeController {
  constructor(private readonly qrCodeService: QrCodeService) {}

  @Get()
  findAll(@Query() query: QrCodeQueryDto) {
    return this.qrCodeService.findAll(query);
  }

  @Get('shop/:shopId')
  findByShop(
    @Param('shopId', new ParseUUIDPipe()) shopId: string,
    @Query() query: QrCodeQueryDto,
  ) {
    return this.qrCodeService.findAll({ ...query, shopId });
  }

  @Post('shop/:shopId')
  create(
    @Param('shopId', new ParseUUIDPipe()) shopId: string,
    @Body() dto: CreateQrCodeDto,
  ) {
    return this.qrCodeService.create(shopId, dto);
  }

  @Get(':id/image')
  @Header('Content-Type', 'image/svg+xml')
  async image(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.qrCodeService.renderSvg(id);
  }
}
