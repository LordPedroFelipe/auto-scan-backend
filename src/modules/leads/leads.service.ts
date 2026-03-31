import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShopEntity } from '../shops/entities/shop.entity';
import { UserEntity } from '../users/entities/user.entity';
import { VehicleEntity } from '../vehicles/entities/vehicle.entity';
import { CreateLeadDto } from './dto/create-lead.dto';
import { LeadsQueryDto } from './dto/leads-query.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { LeadEntity, LeadStatus } from './entities/lead.entity';

@Injectable()
export class LeadsService {
  constructor(
    @InjectRepository(LeadEntity)
    private readonly leadsRepository: Repository<LeadEntity>,
    @InjectRepository(ShopEntity)
    private readonly shopsRepository: Repository<ShopEntity>,
    @InjectRepository(VehicleEntity)
    private readonly vehiclesRepository: Repository<VehicleEntity>,
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
  ) {}

  async findAll(query: LeadsQueryDto) {
    const pageNumber = query.PageNumber ?? query.pageNumber ?? 1;
    const pageSize = query.PageSize ?? query.pageSize ?? 10;
    const shopId = query.shopId ?? query.ShopId;
    const orderBy = query.OrderBy ?? query.orderBy ?? 'CreatedAt';
    const isDescending = query.IsDescending ?? query.isDescending ?? true;

    const qb = this.leadsRepository
      .createQueryBuilder('lead')
      .leftJoinAndSelect('lead.shop', 'shop')
      .leftJoinAndSelect('lead.vehicle', 'vehicle')
      .leftJoinAndSelect('lead.seller', 'seller');

    if (shopId) qb.andWhere('lead.shopId = :shopId', { shopId });
    if (query.CustomerName) qb.andWhere('lead.name ILIKE :name', { name: `%${query.CustomerName}%` });
    if (query.CustomerEmail) qb.andWhere('lead.email ILIKE :email', { email: `%${query.CustomerEmail}%` });
    if (query.CustomerPhone) qb.andWhere('lead.phone ILIKE :phone', { phone: `%${query.CustomerPhone}%` });
    if (query.CustomerCity) qb.andWhere('lead.city ILIKE :city', { city: `%${query.CustomerCity}%` });
    if (query.Origin) qb.andWhere('lead.origin ILIKE :origin', { origin: `%${query.Origin}%` });
    if (query.Status) qb.andWhere('lead.status = :status', { status: query.Status });
    if (query.SellerId) qb.andWhere('lead.sellerId = :sellerId', { sellerId: query.SellerId });

    switch (orderBy) {
      case 'Name':
      case 'name':
        qb.orderBy('lead.name', isDescending ? 'DESC' : 'ASC');
        break;
      case 'LastContactDate':
      case 'lastContactDate':
        qb.orderBy('lead.lastContactDate', isDescending ? 'DESC' : 'ASC', 'NULLS LAST');
        break;
      case 'ContactDate':
      case 'contactDate':
        qb.orderBy('lead.contactDate', isDescending ? 'DESC' : 'ASC', 'NULLS LAST');
        break;
      case 'CreatedAt':
      case 'createdAt':
      default:
        qb.orderBy('lead.createdAt', isDescending ? 'DESC' : 'ASC');
        break;
    }
    qb.skip((pageNumber - 1) * pageSize);
    qb.take(pageSize);

    const [items, totalCount] = await qb.getManyAndCount();

    return {
      items,
      totalCount,
      pageNumber,
      pageSize,
    };
  }

  listStatuses() {
    return Object.values(LeadStatus).map((name, index) => ({
      id: index,
      name,
    }));
  }

  async findOne(id: string) {
    const lead = await this.leadsRepository.findOne({
      where: { id },
      relations: {
        shop: true,
        vehicle: true,
        seller: true,
      },
    });

    if (!lead) {
      throw new NotFoundException('Lead não encontrado.');
    }

    return lead;
  }

  async create(dto: CreateLeadDto) {
    const { shopId, vehicleId } = await this.resolveShopAndVehicle(
      dto.shopId,
      dto.vehicleId,
    );
    await this.ensureRelations(shopId, vehicleId, dto.sellerId);

    const lead = this.leadsRepository.create({
      ...dto,
      email: dto.email?.toLowerCase() ?? null,
      city: dto.city ?? null,
      origin: dto.origin?.trim() ?? null,
      notes: dto.notes ?? null,
      status: dto.status ?? LeadStatus.New,
      hasBeenContacted: dto.hasBeenContacted ?? false,
      contactDate: dto.contactDate ? new Date(dto.contactDate) : null,
      lastContactDate: dto.lastContactDate ? new Date(dto.lastContactDate) : null,
      isActive: dto.isActive ?? true,
      shopId,
      vehicleId,
      sellerId: dto.sellerId ?? null,
    });

    const savedLead = await this.leadsRepository.save(lead);
    return this.findOne(savedLead.id);
  }

  async update(id: string, dto: UpdateLeadDto) {
    const lead = await this.findOne(id);
    const { shopId, vehicleId } = await this.resolveShopAndVehicle(
      dto.shopId ?? lead.shopId,
      dto.vehicleId ?? lead.vehicleId,
    );
    await this.ensureRelations(shopId, vehicleId, dto.sellerId);

    Object.assign(lead, dto);
    if (dto.contactDate) lead.contactDate = new Date(dto.contactDate);
    if (dto.lastContactDate) lead.lastContactDate = new Date(dto.lastContactDate);
    if (dto.email) lead.email = dto.email.toLowerCase();
    if (dto.origin !== undefined) lead.origin = dto.origin?.trim() ?? null;
    lead.shopId = shopId;
    lead.vehicleId = vehicleId;

    const savedLead = await this.leadsRepository.save(lead);
    return this.findOne(savedLead.id);
  }

  async remove(id: string) {
    const lead = await this.findOne(id);
    await this.leadsRepository.remove(lead);
    return { success: true };
  }

  private async ensureRelations(
    shopId?: string | null,
    vehicleId?: string | null,
    sellerId?: string | null,
  ) {
    if (shopId) {
      const shop = await this.shopsRepository.findOne({ where: { id: shopId } });
      if (!shop) throw new BadRequestException('Loja não encontrada.');
    }
    if (vehicleId) {
      const vehicle = await this.vehiclesRepository.findOne({ where: { id: vehicleId } });
      if (!vehicle) throw new BadRequestException('Veículo não encontrado.');
    }
    if (sellerId) {
      const seller = await this.usersRepository.findOne({ where: { id: sellerId } });
      if (!seller) throw new BadRequestException('Usuário vendedor não encontrado.');
    }
  }

  private async resolveShopAndVehicle(
    shopId?: string | null,
    vehicleId?: string | null,
  ) {
    if (!vehicleId) {
      return {
        shopId: shopId ?? null,
        vehicleId: null,
      };
    }

    const vehicle = await this.vehiclesRepository.findOne({
      where: { id: vehicleId },
    });
    if (!vehicle) {
      throw new BadRequestException('Veículo não encontrado.');
    }

    if (shopId && vehicle.shopId && shopId !== vehicle.shopId) {
      throw new BadRequestException(
        'O veículo informado pertence a outra loja.',
      );
    }

    return {
      shopId: shopId ?? vehicle.shopId ?? null,
      vehicleId,
    };
  }
}
