import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreateQrCodeDto } from './dto/create-qr-code.dto';
import { QrCodeQueryDto } from './dto/qr-code-query.dto';
import { QrCodeEntity } from './entities/qr-code.entity';

@Injectable()
export class QrCodeService {
  constructor(
    @InjectRepository(QrCodeEntity)
    private readonly qrCodeRepository: Repository<QrCodeEntity>,
  ) {}

  async findAll(query: QrCodeQueryDto = {}) {
    const pageNumber = query.PageNumber ?? query.pageNumber ?? 1;
    const pageSize = query.PageSize ?? query.pageSize ?? 10;
    const shopId = query.ShopId ?? query.shopId;
    const vehiclePlate = query.VehiclePlate ?? query.vehiclePlate;
    const redirectType = query.RedirectType ?? query.redirectType;

    const qb = this.qrCodeRepository.createQueryBuilder('qrCode');

    if (shopId) {
      qb.andWhere('qrCode.shopId = :shopId', { shopId });
    }
    if (vehiclePlate) {
      qb.andWhere('qrCode.vehiclePlate ILIKE :vehiclePlate', {
        vehiclePlate: `%${vehiclePlate}%`,
      });
    }
    if (redirectType) {
      qb.andWhere('qrCode.redirectType = :redirectType', { redirectType });
    }

    qb.orderBy('qrCode.createdAt', 'DESC');
    qb.skip((pageNumber - 1) * pageSize);
    qb.take(pageSize);

    const [items, totalCount] = await qb.getManyAndCount();
    return {
      items,
      pageNumber,
      pageSize,
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize) || 1,
    };
  }

  async create(shopId: string, dto: CreateQrCodeDto) {
    const qrCode = this.qrCodeRepository.create({
      shopId,
      code: this.generateCode(),
      link: this.buildLink(shopId, dto.redirectType, dto.redirectId),
      redirectId: dto.redirectId,
      redirectType: dto.redirectType,
      vehiclePlate: dto.vehiclePlate ?? null,
    });

    return this.qrCodeRepository.save(qrCode);
  }

  async ensureVehicleQrCode(shopId: string, vehicleId: string, vehiclePlate?: string | null) {
    const existing = await this.qrCodeRepository.findOne({
      where: {
        shopId,
        redirectType: 'Vehicle',
        redirectId: vehicleId,
      },
      order: {
        createdAt: 'DESC',
      },
    });

    if (existing) {
      const nextPlate = vehiclePlate?.trim()?.toUpperCase() || null;
      const nextLink = this.buildLink(shopId, 'Vehicle', vehicleId);
      if (existing.vehiclePlate !== nextPlate || existing.link !== nextLink) {
        existing.vehiclePlate = nextPlate;
        existing.link = nextLink;
        return this.qrCodeRepository.save(existing);
      }
      return existing;
    }

    return this.create(shopId, {
      redirectId: vehicleId,
      redirectType: 'Vehicle',
      vehiclePlate: vehiclePlate?.trim()?.toUpperCase() || undefined,
    });
  }

  async findOrCreateByVehicle(shopId: string, vehicleId: string, vehiclePlate?: string | null) {
    return this.ensureVehicleQrCode(shopId, vehicleId, vehiclePlate);
  }

  async getVehicleQrDetails(shopId: string, vehicleId: string, vehiclePlate?: string | null) {
    const qr = await this.findOrCreateByVehicle(shopId, vehicleId, vehiclePlate);
    return this.toQrResponse(qr);
  }

  async getVehicleQrMap(vehicleIds: string[]) {
    if (!vehicleIds.length) {
      return new Map<string, QrCodeEntity>();
    }

    const items = await this.qrCodeRepository.find({
      where: {
        redirectType: 'Vehicle',
        redirectId: In(vehicleIds),
      },
      order: {
        createdAt: 'DESC',
      },
    });

    const map = new Map<string, QrCodeEntity>();
    for (const item of items) {
      if (item.redirectId && !map.has(item.redirectId)) {
        map.set(item.redirectId, item);
      }
    }

    return map;
  }

  async renderSvg(id: string) {
    const qr = await this.qrCodeRepository.findOne({ where: { id } });
    if (!qr) throw new NotFoundException('QR Code nao encontrado.');

    return this.buildSvg(qr.code);
  }

  async renderVehicleSvg(shopId: string, vehicleId: string, vehiclePlate?: string | null) {
    const qr = await this.findOrCreateByVehicle(shopId, vehicleId, vehiclePlate);
    return this.buildSvg(qr.code);
  }

  private generateCode() {
    return `QR-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
  }

  private buildLink(shopId: string, redirectType: string, redirectId: string) {
    return redirectType === 'Vehicle'
      ? `http://localhost:4200/vehicle/${redirectId}`
      : `http://localhost:4200/shop/${shopId}`;
  }

  private buildSvg(code: string) {
    return `
<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320" viewBox="0 0 320 320">
  <rect width="320" height="320" fill="#ffffff"/>
  <rect x="20" y="20" width="280" height="280" rx="12" fill="#111827"/>
  <rect x="40" y="40" width="80" height="80" fill="#ffffff"/>
  <rect x="200" y="40" width="80" height="80" fill="#ffffff"/>
  <rect x="40" y="200" width="80" height="80" fill="#ffffff"/>
  <text x="160" y="160" text-anchor="middle" fill="#ffffff" font-size="14" font-family="Arial">ScanDrive</text>
  <text x="160" y="185" text-anchor="middle" fill="#d1d5db" font-size="10" font-family="Arial">${code}</text>
</svg>`.trim();
  }

  private toQrResponse(qr: QrCodeEntity) {
    return {
      ...qr,
      imageUrl: `/api/QRCode/${qr.id}/image`,
    };
  }
}
