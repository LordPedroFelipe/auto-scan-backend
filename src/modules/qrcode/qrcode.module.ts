import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QrCodeController } from './qrcode.controller';
import { QrCodeService } from './qrcode.service';
import { QrCodeEntity } from './entities/qr-code.entity';

@Module({
  imports: [TypeOrmModule.forFeature([QrCodeEntity])],
  controllers: [QrCodeController],
  providers: [QrCodeService],
  exports: [QrCodeService],
})
export class QrCodeModule {}

