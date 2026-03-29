import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateQrCodeDto } from './dto/create-qr-code.dto';
import { QrCodeEntity } from './entities/qr-code.entity';

@Injectable()
export class QrCodeService {
  constructor(
    @InjectRepository(QrCodeEntity)
    private readonly qrCodeRepository: Repository<QrCodeEntity>,
  ) {}

  findAll() {
    return this.qrCodeRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  findByShop(shopId: string) {
    return this.qrCodeRepository.find({
      where: { shopId },
      order: { createdAt: 'DESC' },
    });
  }

  async create(shopId: string, dto: CreateQrCodeDto) {
    const code = `QR-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
    const link = dto.redirectType === 'Vehicle'
      ? `http://localhost:4200/vehicle/${dto.redirectId}`
      : `http://localhost:4200/shop/${shopId}`;

    const qrCode = this.qrCodeRepository.create({
      shopId,
      code,
      link,
      redirectId: dto.redirectId,
      redirectType: dto.redirectType,
      vehiclePlate: dto.vehiclePlate ?? null,
    });

    return this.qrCodeRepository.save(qrCode);
  }

  async renderSvg(id: string) {
    const qr = await this.qrCodeRepository.findOne({ where: { id } });
    if (!qr) throw new NotFoundException('QR Code não encontrado.');

    return `
<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320" viewBox="0 0 320 320">
  <rect width="320" height="320" fill="#ffffff"/>
  <rect x="20" y="20" width="280" height="280" rx="12" fill="#111827"/>
  <rect x="40" y="40" width="80" height="80" fill="#ffffff"/>
  <rect x="200" y="40" width="80" height="80" fill="#ffffff"/>
  <rect x="40" y="200" width="80" height="80" fill="#ffffff"/>
  <text x="160" y="160" text-anchor="middle" fill="#ffffff" font-size="14" font-family="Arial">ScanDrive</text>
  <text x="160" y="185" text-anchor="middle" fill="#d1d5db" font-size="10" font-family="Arial">${qr.code}</text>
</svg>`.trim();
  }
}
