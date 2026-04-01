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
exports.VehiclesService = void 0;
const common_1 = require("@nestjs/common");
const fs_1 = require("fs");
const path_1 = require("path");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const shop_entity_1 = require("../shops/entities/shop.entity");
const qrcode_service_1 = require("../qrcode/qrcode.service");
const vehicle_entity_1 = require("./entities/vehicle.entity");
const uploadsDirectory = (0, path_1.join)(process.cwd(), 'uploads', 'vehicles');
let VehiclesService = class VehiclesService {
    constructor(vehiclesRepository, shopsRepository, qrCodeService) {
        this.vehiclesRepository = vehiclesRepository;
        this.shopsRepository = shopsRepository;
        this.qrCodeService = qrCodeService;
    }
    async findAll(query) {
        const pageNumber = query.pageNumber ?? 1;
        const pageSize = query.pageSize ?? 10;
        const search = query.q ?? query.search;
        const qb = this.vehiclesRepository
            .createQueryBuilder('vehicle')
            .leftJoinAndSelect('vehicle.shop', 'shop');
        if (query.shopId) {
            qb.andWhere('vehicle.shopId = :shopId', { shopId: query.shopId });
        }
        if (query.includeInactive !== true) {
            qb.andWhere('vehicle.isActive = :defaultActive', {
                defaultActive: query.isActive ?? true,
            });
        }
        else if (query.isActive !== undefined) {
            qb.andWhere('vehicle.isActive = :isActive', { isActive: query.isActive });
        }
        if (search) {
            qb.andWhere(`(
          vehicle.brand ILIKE :q
          OR vehicle.model ILIKE :q
          OR vehicle.version ILIKE :q
          OR vehicle.plate ILIKE :q
          OR vehicle.color ILIKE :q
          OR vehicle.categoryType ILIKE :q
          OR vehicle.transmission ILIKE :q
          OR vehicle.fuelType ILIKE :q
          OR vehicle.city ILIKE :q
          OR shop.name ILIKE :q
        )`, { q: `%${search}%` });
        }
        if (query.brand) {
            qb.andWhere('vehicle.brand ILIKE :brand', { brand: `%${query.brand}%` });
        }
        if (query.model) {
            qb.andWhere('vehicle.model ILIKE :model', { model: `%${query.model}%` });
        }
        if (query.version) {
            qb.andWhere('vehicle.version ILIKE :version', {
                version: `%${query.version}%`,
            });
        }
        if (query.color) {
            qb.andWhere('vehicle.color ILIKE :color', { color: `%${query.color}%` });
        }
        if (query.transmission) {
            qb.andWhere('vehicle.transmission ILIKE :transmission', {
                transmission: `%${query.transmission}%`,
            });
        }
        if (query.fuelType) {
            qb.andWhere('vehicle.fuelType ILIKE :fuelType', {
                fuelType: `%${query.fuelType}%`,
            });
        }
        if (query.condition) {
            qb.andWhere('vehicle.condition ILIKE :condition', {
                condition: `%${query.condition}%`,
            });
        }
        if (query.categoryType) {
            qb.andWhere('vehicle.categoryType ILIKE :categoryType', {
                categoryType: `%${query.categoryType}%`,
            });
        }
        if (query.city) {
            qb.andWhere('vehicle.city ILIKE :city', { city: `%${query.city}%` });
        }
        if (query.state) {
            qb.andWhere('vehicle.state ILIKE :state', { state: `%${query.state}%` });
        }
        if (query.minPrice !== undefined) {
            qb.andWhere('vehicle.price >= :minPrice', { minPrice: query.minPrice });
        }
        if (query.maxPrice !== undefined) {
            qb.andWhere('vehicle.price <= :maxPrice', { maxPrice: query.maxPrice });
        }
        if (query.minYear !== undefined) {
            qb.andWhere('vehicle.year >= :minYear', { minYear: query.minYear });
        }
        if (query.maxYear !== undefined) {
            qb.andWhere('vehicle.year <= :maxYear', { maxYear: query.maxYear });
        }
        if (query.minMileage !== undefined) {
            qb.andWhere('vehicle.mileage >= :minMileage', {
                minMileage: query.minMileage,
            });
        }
        if (query.maxMileage !== undefined) {
            qb.andWhere('vehicle.mileage <= :maxMileage', {
                maxMileage: query.maxMileage,
            });
        }
        if (query.ownersCountMin !== undefined) {
            qb.andWhere('vehicle.ownersCount >= :ownersCountMin', {
                ownersCountMin: query.ownersCountMin,
            });
        }
        if (query.ownersCountMax !== undefined) {
            qb.andWhere('vehicle.ownersCount <= :ownersCountMax', {
                ownersCountMax: query.ownersCountMax,
            });
        }
        if (query.hasAuction !== undefined) {
            qb.andWhere('vehicle.hasAuction = :hasAuction', {
                hasAuction: query.hasAuction,
            });
        }
        if (query.hasAccident !== undefined) {
            qb.andWhere('vehicle.hasAccident = :hasAccident', {
                hasAccident: query.hasAccident,
            });
        }
        if (query.isFirstOwner !== undefined) {
            qb.andWhere('vehicle.isFirstOwner = :isFirstOwner', {
                isFirstOwner: query.isFirstOwner,
            });
        }
        if (query.isConsigned !== undefined) {
            qb.andWhere('vehicle.isConsigned = :isConsigned', {
                isConsigned: query.isConsigned,
            });
        }
        if (query.isSold !== undefined) {
            qb.andWhere('vehicle.isSold = :isSold', { isSold: query.isSold });
        }
        if (query.isOnOffer !== undefined) {
            qb.andWhere('vehicle.isOnOffer = :isOnOffer', { isOnOffer: query.isOnOffer });
        }
        if (query.isHighlighted !== undefined) {
            qb.andWhere('vehicle.isHighlighted = :isHighlighted', {
                isHighlighted: query.isHighlighted,
            });
        }
        switch (query.sort) {
            case 'newest':
                qb.orderBy('vehicle.createdAt', 'DESC');
                break;
            case 'price_asc':
                qb.orderBy('vehicle.price', 'ASC');
                break;
            case 'price_desc':
                qb.orderBy('vehicle.price', 'DESC');
                break;
            case 'mileage_asc':
                qb.orderBy('vehicle.mileage', 'ASC');
                break;
            case 'mileage_desc':
                qb.orderBy('vehicle.mileage', 'DESC');
                break;
            case 'year_asc':
                qb.orderBy('vehicle.year', 'ASC');
                break;
            case 'year_desc':
                qb.orderBy('vehicle.year', 'DESC');
                break;
            default:
                qb.orderBy('vehicle.createdAt', 'DESC');
                break;
        }
        qb.skip((pageNumber - 1) * pageSize);
        qb.take(pageSize);
        const [items, totalCount] = await qb.getManyAndCount();
        const qrMap = await this.qrCodeService.getVehicleQrMap(items.map((item) => item.id));
        return {
            items: items.map((item) => this.toResponse(item, undefined, qrMap.has(item.id))),
            pageNumber,
            pageSize,
            totalCount,
        };
    }
    async listItems() {
        const vehicles = await this.vehiclesRepository.find({
            select: {
                id: true,
                brand: true,
                model: true,
                version: true,
                year: true,
            },
            where: {
                isActive: true,
            },
            order: {
                createdAt: 'DESC',
            },
            take: 100,
        });
        return vehicles.map((vehicle) => ({
            id: vehicle.id,
            label: `${vehicle.brand} ${vehicle.model} ${vehicle.version ?? ''} ${vehicle.year}`.trim(),
            description: `${vehicle.brand} ${vehicle.model} ${vehicle.version ?? ''} ${vehicle.year}`.trim(),
        }));
    }
    async findOne(id) {
        const vehicle = await this.vehiclesRepository.findOne({
            where: { id },
            relations: {
                shop: true,
            },
        });
        if (!vehicle) {
            throw new common_1.NotFoundException('Veículo não encontrado.');
        }
        const hasQrCode = !!(await this.qrCodeService.getVehicleQrMap([vehicle.id])).get(vehicle.id);
        return this.toResponse(vehicle, undefined, hasQrCode);
    }
    async create(dto, files = [], request) {
        await this.ensureShopExists(dto.shopId);
        const normalizedPhotos = this.normalizePhotoCollections(dto.retainedPhotoUrls ?? dto.photoUrls ?? [], files);
        const vehicle = this.vehiclesRepository.create({
            ...dto,
            version: dto.version ?? null,
            plate: dto.plate ?? null,
            color: dto.color ?? null,
            transmission: dto.transmission ?? null,
            fuelType: dto.fuelType ?? null,
            condition: dto.condition ?? null,
            categoryType: dto.categoryType ?? null,
            city: dto.city ?? null,
            state: dto.state ?? null,
            description: dto.description ?? null,
            ownersCount: dto.ownersCount ?? null,
            mileage: dto.mileage ?? null,
            photoUrls: normalizedPhotos.originalPhotoUrls,
            originalPhotoUrls: normalizedPhotos.originalPhotoUrls,
            thumbnailPhotoUrls: normalizedPhotos.thumbnailPhotoUrls,
            isActive: dto.isActive ?? true,
            hasAuction: dto.hasAuction ?? false,
            hasAccident: dto.hasAccident ?? false,
            isFirstOwner: dto.isFirstOwner ?? false,
            isConsigned: dto.isConsigned ?? false,
            isOnOffer: dto.isOnOffer ?? false,
            isHighlighted: dto.isHighlighted ?? false,
            isSold: dto.isSold ?? false,
        });
        const savedVehicle = await this.vehiclesRepository.save(vehicle);
        await this.qrCodeService.ensureVehicleQrCode(savedVehicle.shopId, savedVehicle.id, savedVehicle.plate);
        return this.findOneWithRequest(savedVehicle.id, request);
    }
    async update(id, dto, files = [], request) {
        const vehicle = await this.vehiclesRepository.findOne({
            where: { id },
            relations: {
                shop: true,
            },
        });
        if (!vehicle) {
            throw new common_1.NotFoundException('Veículo não encontrado.');
        }
        if (dto.shopId && dto.shopId !== vehicle.shopId) {
            await this.ensureShopExists(dto.shopId);
        }
        const previousPhotoUrls = [...(vehicle.originalPhotoUrls ?? vehicle.photoUrls ?? [])];
        Object.assign(vehicle, dto);
        if (dto.photoUrls || dto.retainedPhotoUrls || files.length) {
            const normalizedPhotos = this.normalizePhotoCollections(dto.retainedPhotoUrls ?? dto.photoUrls ?? previousPhotoUrls, files);
            Object.assign(vehicle, {
                photoUrls: normalizedPhotos.originalPhotoUrls,
                originalPhotoUrls: normalizedPhotos.originalPhotoUrls,
                thumbnailPhotoUrls: normalizedPhotos.thumbnailPhotoUrls,
            });
            const keptUrls = new Set(normalizedPhotos.originalPhotoUrls);
            this.removeLocalPhotos(previousPhotoUrls.filter((url) => !keptUrls.has(url)));
        }
        const savedVehicle = await this.vehiclesRepository.save(vehicle);
        await this.qrCodeService.ensureVehicleQrCode(savedVehicle.shopId, savedVehicle.id, savedVehicle.plate);
        return this.findOneWithRequest(savedVehicle.id, request);
    }
    async remove(id) {
        const vehicle = await this.vehiclesRepository.findOne({
            where: { id },
            relations: {
                shop: true,
            },
        });
        if (!vehicle) {
            throw new common_1.NotFoundException('Veículo não encontrado.');
        }
        this.removeLocalPhotos(vehicle.originalPhotoUrls ?? vehicle.photoUrls ?? []);
        await this.vehiclesRepository.remove(vehicle);
        return { success: true };
    }
    async ensureShopExists(shopId) {
        const shop = await this.shopsRepository.findOne({ where: { id: shopId } });
        if (!shop) {
            throw new common_1.BadRequestException('Loja não encontrada.');
        }
    }
    async findOneWithRequest(id, request) {
        const vehicle = await this.vehiclesRepository.findOne({
            where: { id },
            relations: {
                shop: true,
            },
        });
        if (!vehicle) {
            throw new common_1.NotFoundException('Veículo não encontrado.');
        }
        const hasQrCode = !!(await this.qrCodeService.getVehicleQrMap([vehicle.id])).get(vehicle.id);
        return this.toResponse(vehicle, request, hasQrCode);
    }
    normalizePhotoCollections(photoUrls, uploadedFiles = []) {
        const uploadedPhotoUrls = uploadedFiles.map((file) => `/uploads/vehicles/${file.filename}`);
        const originalPhotoUrls = [...photoUrls, ...uploadedPhotoUrls];
        const thumbnailPhotoUrls = [...photoUrls, ...uploadedPhotoUrls];
        return {
            originalPhotoUrls,
            thumbnailPhotoUrls,
        };
    }
    removeLocalPhotos(photoUrls) {
        for (const url of photoUrls) {
            const filePath = this.resolveLocalUploadPath(url);
            if (filePath && (0, fs_1.existsSync)(filePath)) {
                (0, fs_1.unlinkSync)(filePath);
            }
        }
    }
    resolveLocalUploadPath(url) {
        if (!url.startsWith('/uploads/vehicles/')) {
            return null;
        }
        const filename = url.replace('/uploads/vehicles/', '');
        if (!filename || filename.includes('..')) {
            return null;
        }
        return (0, path_1.join)(uploadsDirectory, filename);
    }
    normalizePublicUrl(url, request) {
        if (!url.startsWith('/uploads/')) {
            return url;
        }
        if (!request) {
            return url;
        }
        return `${request.protocol}://${request.get('host')}${url}`;
    }
    toResponse(vehicle, request, hasQrCode) {
        const originalPhotoUrls = vehicle.originalPhotoUrls?.length
            ? vehicle.originalPhotoUrls
            : vehicle.photoUrls ?? [];
        const thumbnailPhotoUrls = vehicle.thumbnailPhotoUrls?.length
            ? vehicle.thumbnailPhotoUrls
            : vehicle.photoUrls ?? [];
        const normalizedOriginalPhotoUrls = originalPhotoUrls.map((url) => this.normalizePublicUrl(url, request));
        const normalizedThumbnailPhotoUrls = thumbnailPhotoUrls.map((url) => this.normalizePublicUrl(url, request));
        const mainPhotoUrl = normalizedThumbnailPhotoUrls[0] ?? normalizedOriginalPhotoUrls[0] ?? null;
        const originalMainPhotoUrl = normalizedOriginalPhotoUrls[0] ?? null;
        return {
            ...vehicle,
            shopName: vehicle.shop?.name ?? null,
            licensePlate: vehicle.plate ?? null,
            photoUrls: normalizedOriginalPhotoUrls,
            originalPhotoUrls: normalizedOriginalPhotoUrls,
            thumbnailPhotoUrls: normalizedThumbnailPhotoUrls,
            mainPhotoUrl,
            originalMainPhotoUrl,
            price: Number(vehicle.price),
            mileage: vehicle.mileage === null ? null : Number(vehicle.mileage),
            ownersCount: vehicle.ownersCount === null ? null : Number(vehicle.ownersCount),
            hasQrCode: hasQrCode ?? false,
        };
    }
};
exports.VehiclesService = VehiclesService;
exports.VehiclesService = VehiclesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(vehicle_entity_1.VehicleEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(shop_entity_1.ShopEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        qrcode_service_1.QrCodeService])
], VehiclesService);
