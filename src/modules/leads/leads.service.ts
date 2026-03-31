import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LeadNoteEntity } from '../lead-notes/entities/lead-note.entity';
import { SaleClosureEntity, SaleOutcomeType } from '../sales/entities/sale-closure.entity';
import { ShopEntity } from '../shops/entities/shop.entity';
import { TestDriveEntity } from '../test-drives/entities/test-drive.entity';
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
    @InjectRepository(LeadNoteEntity)
    private readonly leadNotesRepository: Repository<LeadNoteEntity>,
    @InjectRepository(TestDriveEntity)
    private readonly testDrivesRepository: Repository<TestDriveEntity>,
    @InjectRepository(SaleClosureEntity)
    private readonly saleClosuresRepository: Repository<SaleClosureEntity>,
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
      origin: this.resolveLeadOrigin(dto.origin, 'CRM Manual'),
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

  async crmDetail(id: string) {
    const lead = await this.findOne(id);

    const [notes, testDrives, saleClosure] = await Promise.all([
      this.leadNotesRepository.find({
        where: { leadId: id },
        relations: { user: true },
        order: { createdAt: 'DESC' },
        take: 100,
      }),
      this.testDrivesRepository.find({
        where: { leadId: id },
        relations: { vehicle: true, shop: true, lead: true },
        order: { preferredDate: 'DESC' },
        take: 20,
      }),
      this.saleClosuresRepository.findOne({
        where: { leadId: id },
        relations: { lead: true, seller: true, vehicle: true, testDrive: true, shop: true },
      }),
    ]);

    const timeline = [
      {
        id: `lead-created-${lead.id}`,
        kind: 'lead_created',
        title: 'Lead criado',
        description: `Lead entrou na operacao${lead.origin ? ` via ${lead.origin}` : ''}.`,
        occurredAt: lead.createdAt,
        tone: 'ocean',
      },
      ...(lead.contactDate
        ? [{
            id: `lead-contact-${lead.id}`,
            kind: 'first_contact',
            title: 'Primeiro contato registrado',
            description: 'O time marcou o primeiro contato comercial.',
            occurredAt: lead.contactDate,
            tone: 'amber',
          }]
        : []),
      ...(lead.lastContactDate
        ? [{
            id: `lead-last-contact-${lead.id}`,
            kind: 'last_contact',
            title: 'Ultimo follow-up registrado',
            description: 'Lead recebeu interacao recente do time.',
            occurredAt: lead.lastContactDate,
            tone: 'plum',
          }]
        : []),
      ...notes.map((note) => ({
        id: `note-${note.id}`,
        kind: 'note',
        title: note.type,
        description: note.comment,
        occurredAt: note.createdAt,
        tone: note.type === 'Aviso' ? 'danger' : note.type === 'Contato' ? 'amber' : 'slate',
        meta: {
          userName: note.user?.userName ?? 'Sistema',
        },
      })),
      ...testDrives.map((testDrive) => ({
        id: `test-drive-${testDrive.id}`,
        kind: 'test_drive',
        title: 'Test drive registrado',
        description: `${testDrive.vehicle?.brand ?? ''} ${testDrive.vehicle?.model ?? ''} ${testDrive.vehicle?.version ?? ''}`.trim() || 'Agendamento vinculado ao lead',
        occurredAt: testDrive.preferredDate,
        tone: testDrive.status === 'Completed' ? 'forest' : testDrive.status === 'Canceled' ? 'danger' : 'ocean',
        meta: {
          status: testDrive.status,
          preferredTime: testDrive.preferredTime,
        },
      })),
      ...(saleClosure
        ? [{
            id: `sale-${saleClosure.id}`,
            kind: 'sale_closure',
            title: saleClosure.outcomeType === SaleOutcomeType.Sale ? 'Venda registrada' : 'Nao venda registrada',
            description: saleClosure.notes || saleClosure.noSaleReason || 'Decisao final do lead registrada.',
            occurredAt: saleClosure.closedAt,
            tone: saleClosure.outcomeType === SaleOutcomeType.Sale ? 'forest' : 'danger',
            meta: {
              outcomeType: saleClosure.outcomeType,
              salePrice: saleClosure.salePrice,
              sellerName: saleClosure.seller?.userName ?? null,
            },
          }]
        : []),
    ]
      .sort((left, right) => new Date(right.occurredAt).getTime() - new Date(left.occurredAt).getTime());

    const createdAt = lead.createdAt ? new Date(lead.createdAt).getTime() : Date.now();
    const daysOpen = Math.max(Math.ceil((Date.now() - createdAt) / 86400000), 0);

    return {
      lead,
      summary: {
        daysOpen,
        noteCount: notes.length,
        testDriveCount: testDrives.length,
        hasSaleClosure: !!saleClosure,
        lastInteractionAt:
          timeline[0]?.occurredAt?.toISOString?.()
          ?? (timeline[0]?.occurredAt ? new Date(timeline[0].occurredAt).toISOString() : null),
      },
      notes: notes.map((note) => ({
        id: note.id,
        leadId: note.leadId,
        userId: note.userId,
        userName: note.user?.userName ?? 'Sistema',
        comment: note.comment,
        type: note.type,
        createdAt: note.createdAt,
      })),
      testDrives: testDrives.map((testDrive) => ({
        id: testDrive.id,
        vehicleId: testDrive.vehicleId,
        shopId: testDrive.shopId,
        leadId: testDrive.leadId,
        customerName: testDrive.customerName,
        customerEmail: testDrive.customerEmail,
        customerPhone: testDrive.customerPhone,
        preferredDate: testDrive.preferredDate,
        preferredTime: testDrive.preferredTime,
        notes: testDrive.notes,
        status: testDrive.status,
        createdAt: testDrive.createdAt,
        updatedAt: testDrive.updatedAt,
        vehicleBrand: testDrive.vehicle?.brand ?? null,
        vehicleModel: testDrive.vehicle?.model ?? null,
        vehicleVersion: testDrive.vehicle?.version ?? null,
        vehicleYear: testDrive.vehicle?.year ?? null,
        vehicleMainPhotoUrl:
          testDrive.vehicle?.thumbnailPhotoUrls?.[0]
          ?? testDrive.vehicle?.originalPhotoUrls?.[0]
          ?? testDrive.vehicle?.photoUrls?.[0]
          ?? null,
        shopName: testDrive.shop?.name ?? null,
      })),
      saleClosure: saleClosure
        ? {
            id: saleClosure.id,
            outcomeType: saleClosure.outcomeType,
            paymentMethod: saleClosure.paymentMethod,
            giftType: saleClosure.giftType,
            noSaleReason: saleClosure.noSaleReason,
            listPrice: Number(saleClosure.listPrice ?? 0),
            salePrice: Number(saleClosure.salePrice ?? 0),
            discountValue: Number(saleClosure.discountValue ?? 0),
            discountPercent: Number(saleClosure.discountPercent ?? 0),
            entryValue: saleClosure.entryValue == null ? null : Number(saleClosure.entryValue),
            installments: saleClosure.installments,
            commissionValue: saleClosure.commissionValue == null ? null : Number(saleClosure.commissionValue),
            tradeInAccepted: saleClosure.tradeInAccepted,
            tradeInDescription: saleClosure.tradeInDescription,
            competitorName: saleClosure.competitorName,
            accessoryDescription: saleClosure.accessoryDescription,
            closedAt: saleClosure.closedAt,
            notes: saleClosure.notes,
            seller: saleClosure.seller
              ? {
                  id: saleClosure.seller.id,
                  userName: saleClosure.seller.userName ?? null,
                  email: saleClosure.seller.email ?? null,
                }
              : null,
            vehicle: saleClosure.vehicle
              ? {
                  id: saleClosure.vehicle.id,
                  label: [saleClosure.vehicle.brand, saleClosure.vehicle.model, saleClosure.vehicle.version].filter(Boolean).join(' '),
                  brand: saleClosure.vehicle.brand ?? null,
                  model: saleClosure.vehicle.model ?? null,
                  version: saleClosure.vehicle.version ?? null,
                  year: saleClosure.vehicle.year ?? null,
                  price: saleClosure.vehicle.price == null ? null : Number(saleClosure.vehicle.price),
                  mainPhotoUrl:
                    saleClosure.vehicle.thumbnailPhotoUrls?.[0]
                    ?? saleClosure.vehicle.originalPhotoUrls?.[0]
                    ?? saleClosure.vehicle.photoUrls?.[0]
                    ?? null,
                }
              : null,
          }
        : null,
      timeline,
    };
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

  private resolveLeadOrigin(origin?: string | null, fallback = 'CRM Manual') {
    const normalized = origin?.trim();
    return normalized ? normalized : fallback;
  }
}
