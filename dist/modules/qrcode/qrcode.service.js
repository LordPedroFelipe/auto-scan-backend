"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QrCodeService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const qr_code_entity_1 = require("./entities/qr-code.entity");
let QrCodeService = class QrCodeService {
    constructor(qrCodeRepository) {
        this.qrCodeRepository = qrCodeRepository;
    }
    async findAll(query = {}) {
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
    async create(shopId, dto) {
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
    async ensureVehicleQrCode(shopId, vehicleId, vehiclePlate) {
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
    async findOrCreateByVehicle(shopId, vehicleId, vehiclePlate) {
        return this.ensureVehicleQrCode(shopId, vehicleId, vehiclePlate);
    }
    async getVehicleQrDetails(shopId, vehicleId, vehiclePlate) {
        const qr = await this.findOrCreateByVehicle(shopId, vehicleId, vehiclePlate);
        return this.toQrResponse(qr);
    }
    async getVehicleQrMap(vehicleIds) {
        if (!vehicleIds.length) {
            return new Map();
        }
        const items = await this.qrCodeRepository.find({
            where: {
                redirectType: 'Vehicle',
                redirectId: (0, typeorm_2.In)(vehicleIds),
            },
            order: {
                createdAt: 'DESC',
            },
        });
        const map = new Map();
        for (const item of items) {
            if (item.redirectId && !map.has(item.redirectId)) {
                map.set(item.redirectId, item);
            }
        }
        return map;
    }
    async renderSvg(id) {
        const qr = await this.qrCodeRepository.findOne({ where: { id } });
        if (!qr)
            throw new common_1.NotFoundException('QR Code nao encontrado.');
        return this.buildSvg(qr.code);
    }
    async renderVehicleSvg(shopId, vehicleId, vehiclePlate) {
        const qr = await this.findOrCreateByVehicle(shopId, vehicleId, vehiclePlate);
        return this.buildSvg(qr.code);
    }
    generateCode() {
        return `QR-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
    }
    buildLink(shopId, redirectType, redirectId) {
        return redirectType === 'Vehicle'
            ? `http://localhost:4200/vehicle/${redirectId}`
            : `http://localhost:4200/shop/${shopId}`;
    }
    buildSvg(code) {
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
    toQrResponse(qr) {
        return {
            ...qr,
            imageUrl: `/api/QRCode/${qr.id}/image`,
        };
    }
};
exports.QrCodeService = QrCodeService;
exports.QrCodeService = QrCodeService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(qr_code_entity_1.QrCodeEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], QrCodeService);
