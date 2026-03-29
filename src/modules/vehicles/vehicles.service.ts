import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShopEntity } from '../shops/entities/shop.entity';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { VehiclesQueryDto } from './dto/vehicles-query.dto';
import { VehicleEntity } from './entities/vehicle.entity';

@Injectable()
export class VehiclesService {
  constructor(
    @InjectRepository(VehicleEntity)
    private readonly vehiclesRepository: Repository<VehicleEntity>,
    @InjectRepository(ShopEntity)
    private readonly shopsRepository: Repository<ShopEntity>,
  ) {}

  async findAll(query: VehiclesQueryDto) {
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
    } else if (query.isActive !== undefined) {
      qb.andWhere('vehicle.isActive = :isActive', { isActive: query.isActive });
    }

    if (search) {
      qb.andWhere(
        '(vehicle.brand ILIKE :q OR vehicle.model ILIKE :q OR vehicle.version ILIKE :q OR shop.name ILIKE :q)',
        { q: `%${search}%` },
      );
    }

    if (query.brand) qb.andWhere('vehicle.brand ILIKE :brand', { brand: `%${query.brand}%` });
    if (query.model) qb.andWhere('vehicle.model ILIKE :model', { model: `%${query.model}%` });
    if (query.city) qb.andWhere('vehicle.city ILIKE :city', { city: `%${query.city}%` });
    if (query.state) qb.andWhere('vehicle.state ILIKE :state', { state: `%${query.state}%` });
    if (query.minPrice !== undefined) qb.andWhere('vehicle.price >= :minPrice', { minPrice: query.minPrice });
    if (query.maxPrice !== undefined) qb.andWhere('vehicle.price <= :maxPrice', { maxPrice: query.maxPrice });
    if (query.minYear !== undefined) qb.andWhere('vehicle.year >= :minYear', { minYear: query.minYear });
    if (query.maxYear !== undefined) qb.andWhere('vehicle.year <= :maxYear', { maxYear: query.maxYear });
    if (query.isSold !== undefined) qb.andWhere('vehicle.isSold = :isSold', { isSold: query.isSold });
    if (query.isOnOffer !== undefined) qb.andWhere('vehicle.isOnOffer = :isOnOffer', { isOnOffer: query.isOnOffer });

    switch (query.sort) {
      case 'price_asc':
        qb.orderBy('vehicle.price', 'ASC');
        break;
      case 'price_desc':
        qb.orderBy('vehicle.price', 'DESC');
        break;
      case 'mileage_asc':
        qb.orderBy('vehicle.mileage', 'ASC');
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

    return {
      items: items.map((item) => this.toResponse(item)),
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

  async findOne(id: string) {
    const vehicle = await this.vehiclesRepository.findOne({
      where: { id },
      relations: {
        shop: true,
      },
    });

    if (!vehicle) {
      throw new NotFoundException('Veículo não encontrado.');
    }

    return this.toResponse(vehicle);
  }

  async create(dto: CreateVehicleDto) {
    await this.ensureShopExists(dto.shopId);

    const normalizedPhotos = this.normalizePhotoCollections(dto.photoUrls ?? []);

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
      isOnOffer: dto.isOnOffer ?? false,
      isHighlighted: dto.isHighlighted ?? false,
      isSold: dto.isSold ?? false,
    });

    const savedVehicle = await this.vehiclesRepository.save(vehicle);
    return this.findOne(savedVehicle.id);
  }

  async update(id: string, dto: UpdateVehicleDto) {
    const vehicle = await this.findOne(id);

    if (dto.shopId && dto.shopId !== vehicle.shopId) {
      await this.ensureShopExists(dto.shopId);
    }

    Object.assign(vehicle, dto);

    if (dto.photoUrls) {
      const normalizedPhotos = this.normalizePhotoCollections(dto.photoUrls);
      Object.assign(vehicle, {
        photoUrls: normalizedPhotos.originalPhotoUrls,
        originalPhotoUrls: normalizedPhotos.originalPhotoUrls,
        thumbnailPhotoUrls: normalizedPhotos.thumbnailPhotoUrls,
      });
    }

    const savedVehicle = await this.vehiclesRepository.save(vehicle);
    return this.findOne(savedVehicle.id);
  }

  async remove(id: string) {
    const vehicle = await this.findOne(id);
    await this.vehiclesRepository.remove(vehicle);
    return { success: true };
  }

  private async ensureShopExists(shopId: string) {
    const shop = await this.shopsRepository.findOne({ where: { id: shopId } });
    if (!shop) {
      throw new BadRequestException('Loja não encontrada.');
    }
  }

  private normalizePhotoCollections(photoUrls: string[]) {
    const originalPhotoUrls = [...photoUrls];
    const thumbnailPhotoUrls = [...photoUrls];

    return {
      originalPhotoUrls,
      thumbnailPhotoUrls,
    };
  }

  private toResponse(vehicle: VehicleEntity) {
    const originalPhotoUrls = vehicle.originalPhotoUrls?.length
      ? vehicle.originalPhotoUrls
      : vehicle.photoUrls ?? [];
    const thumbnailPhotoUrls = vehicle.thumbnailPhotoUrls?.length
      ? vehicle.thumbnailPhotoUrls
      : vehicle.photoUrls ?? [];
    const mainPhotoUrl = thumbnailPhotoUrls[0] ?? originalPhotoUrls[0] ?? null;
    const originalMainPhotoUrl = originalPhotoUrls[0] ?? null;

    return {
      ...vehicle,
      photoUrls: originalPhotoUrls,
      originalPhotoUrls,
      thumbnailPhotoUrls,
      mainPhotoUrl,
      originalMainPhotoUrl,
      price: Number(vehicle.price),
      mileage: vehicle.mileage === null ? null : Number(vehicle.mileage),
      ownersCount: vehicle.ownersCount === null ? null : Number(vehicle.ownersCount),
    };
  }
}
