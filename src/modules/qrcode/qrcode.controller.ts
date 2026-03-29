import { Body, Controller, Get, Header, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateQrCodeDto } from './dto/create-qr-code.dto';
import { QrCodeQueryDto } from './dto/qr-code-query.dto';
import { QrCodeService } from './qrcode.service';

@ApiTags('QRCode')
@Controller('QRCode')
export class QrCodeController {
  constructor(private readonly qrCodeService: QrCodeService) {}

  @ApiOperation({ summary: 'Listar QR Codes' })
  @Get()
  findAll(@Query() query: QrCodeQueryDto) {
    return this.qrCodeService.findAll(query);
  }

  @ApiOperation({ summary: 'Listar QR Codes por loja' })
  @Get('shop/:shopId')
  findByShop(
    @Param('shopId', new ParseUUIDPipe()) shopId: string,
    @Query() query: QrCodeQueryDto,
  ) {
    return this.qrCodeService.findAll({ ...query, shopId });
  }

  @ApiOperation({ summary: 'Criar QR Code para uma loja' })
  @Post('shop/:shopId')
  create(
    @Param('shopId', new ParseUUIDPipe()) shopId: string,
    @Body() dto: CreateQrCodeDto,
  ) {
    return this.qrCodeService.create(shopId, dto);
  }

  @ApiOperation({ summary: 'Renderizar imagem SVG do QR Code' })
  @Get(':id/image')
  @Header('Content-Type', 'image/svg+xml')
  async image(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.qrCodeService.renderSvg(id);
  }
}
