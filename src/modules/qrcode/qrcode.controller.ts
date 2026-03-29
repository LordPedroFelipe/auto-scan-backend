import { Controller, Get, Header, Param, ParseUUIDPipe, Post, Body } from '@nestjs/common';
import { CreateQrCodeDto } from './dto/create-qr-code.dto';
import { QrCodeService } from './qrcode.service';

@Controller('QRCode')
export class QrCodeController {
  constructor(private readonly qrCodeService: QrCodeService) {}

  @Get()
  findAll() {
    return this.qrCodeService.findAll();
  }

  @Get('shop/:shopId')
  findByShop(@Param('shopId', new ParseUUIDPipe()) shopId: string) {
    return this.qrCodeService.findByShop(shopId);
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
