import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LeadEntity, LeadStatus } from '../leads/entities/lead.entity';
import { ShopEntity } from '../shops/entities/shop.entity';
import { TestDriveEntity } from '../test-drives/entities/test-drive.entity';
import { UserEntity } from '../users/entities/user.entity';
import { VehicleEntity } from '../vehicles/entities/vehicle.entity';
import { CreateSaleClosureDto } from './dto/create-sale-closure.dto';
import { SaleClosuresQueryDto } from './dto/sale-closures-query.dto';
import { UpdateSaleClosureDto } from './dto/update-sale-closure.dto';
import {
  NoSaleReason,
  PaymentMethod,
  SaleClosureEntity,
  SaleGiftType,
  SaleOutcomeType,
} from './entities/sale-closure.entity';

@Injectable()
export class SalesService {
  constructor(
    @InjectRepository(SaleClosureEntity)
    private readonly salesRepository: Repository<SaleClosureEntity>,
    @InjectRepository(LeadEntity)
    private readonly leadsRepository: Repository<LeadEntity>,
    @InjectRepository(ShopEntity)
    private readonly shopsRepository: Repository<ShopEntity>,
    @InjectRepository(VehicleEntity)
    private readonly vehiclesRepository: Repository<VehicleEntity>,
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    @InjectRepository(TestDriveEntity)
    private readonly testDrivesRepository: Repository<TestDriveEntity>,
  ) {}

  getOptions() {
    return {
      outcomeTypes: this.mapEnum(SaleOutcomeType, {
        [SaleOutcomeType.Sale]: 'Venda',
        [SaleOutcomeType.NoSale]: 'Nao venda',
      }),
      paymentMethods: this.mapEnum(PaymentMethod, {
        [PaymentMethod.Cash]: 'A vista',
        [PaymentMethod.Financing]: 'Financiamento',
        [PaymentMethod.Consorcio]: 'Consorcio',
        [PaymentMethod.Pix]: 'Pix',
        [PaymentMethod.BankTransfer]: 'Transferencia',
        [PaymentMethod.CreditCard]: 'Cartao',
        [PaymentMethod.TradeIn]: 'Troca',
        [PaymentMethod.Other]: 'Outro',
      }),
      giftTypes: this.mapEnum(SaleGiftType, {
        [SaleGiftType.None]: 'Sem brinde',
        [SaleGiftType.FuelTank]: 'Tanque cheio',
        [SaleGiftType.Documentation]: 'Documentacao',
        [SaleGiftType.Warranty]: 'Garantia',
        [SaleGiftType.AccessoryKit]: 'Kit de acessorios',
        [SaleGiftType.ProtectionFilm]: 'Pel�cula / protecao',
        [SaleGiftType.InsuranceBonus]: 'Bonus no seguro',
        [SaleGiftType.ServicePackage]: 'Pacote de servicos',
        [SaleGiftType.Other]: 'Outro',
      }),
      noSaleReasons: this.mapEnum(NoSaleReason, {
        [NoSaleReason.Price]: 'Preco',
        [NoSaleReason.CreditDenied]: 'Credito negado',
        [NoSaleReason.ChoseCompetitor]: 'Escolheu concorrente',
        [NoSaleReason.NoContact]: 'Sem contato',
        [NoSaleReason.StockUnavailable]: 'Estoque indisponivel',
        [NoSaleReason.PostponedDecision]: 'Decisao adiada',
        [NoSaleReason.VehicleMismatch]: 'Veiculo nao aderente',
        [NoSaleReason.Other]: 'Outro',
        [NoSaleReason.NotInformed]: 'Nao informado',
      }),
    };
  }

  async findAll(query: SaleClosuresQueryDto = {}) {
    const pageNumber = query.pageNumber ?? 1;
    const pageSize = query.pageSize ?? 10;
    const orderBy = query.orderBy ?? 'closedAt';
    const isDescending = query.isDescending ?? true;

    const qb = this.salesRepository
      .createQueryBuilder('sale')
      .leftJoinAndSelect('sale.shop', 'shop')
      .leftJoinAndSelect('sale.lead', 'lead')
      .leftJoinAndSelect('sale.vehicle', 'vehicle')
      .leftJoinAndSelect('sale.seller', 'seller')
      .leftJoinAndSelect('sale.testDrive', 'testDrive');

    if (query.shopId) qb.andWhere('sale.shopId = :shopId', { shopId: query.shopId });
    if (query.leadId) qb.andWhere('sale.leadId = :leadId', { leadId: query.leadId });
    if (query.sellerId) qb.andWhere('sale.sellerId = :sellerId', { sellerId: query.sellerId });
    if (query.outcomeType) qb.andWhere('sale.outcomeType = :outcomeType', { outcomeType: query.outcomeType });
    if (query.noSaleReason) qb.andWhere('sale.noSaleReason = :noSaleReason', { noSaleReason: query.noSaleReason });
    if (query.giftType) qb.andWhere('sale.giftType = :giftType', { giftType: query.giftType });
    if (query.customerName) {
      qb.andWhere('(lead.name ILIKE :customerName OR lead.email ILIKE :customerName OR lead.phone ILIKE :customerName)', {
        customerName: `%${query.customerName}%`,
      });
    }
    if (query.closedFrom) qb.andWhere('sale.closedAt >= :closedFrom', { closedFrom: new Date(query.closedFrom) });
    if (query.closedTo) qb.andWhere('sale.closedAt <= :closedTo', { closedTo: new Date(query.closedTo) });

    const sortableMap: Record<string, string> = {
      closedAt: 'sale.closedAt',
      createdAt: 'sale.createdAt',
      salePrice: 'sale.salePrice',
      listPrice: 'sale.listPrice',
      discountValue: 'sale.discountValue',
      customerName: 'lead.name',
    };

    qb.orderBy(sortableMap[orderBy] ?? 'sale.closedAt', isDescending ? 'DESC' : 'ASC');

    const summaryItems = await qb.clone().getMany();

    qb.skip((pageNumber - 1) * pageSize);
    qb.take(pageSize);

    const [items, totalCount] = await qb.getManyAndCount();

    return {
      items: items.map((item) => this.toResponse(item)),
      pageNumber,
      pageSize,
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize) || 1,
      summary: this.buildSummary(summaryItems),
    };
  }

  async findOne(id: string) {
    const sale = await this.salesRepository.findOne({
      where: { id },
      relations: {
        shop: true,
        lead: true,
        vehicle: true,
        seller: true,
        testDrive: true,
      },
    });

    if (!sale) throw new NotFoundException('Fechamento n�o encontrado.');
    return this.toResponse(sale);
  }

  async create(dto: CreateSaleClosureDto) {
    const lead = await this.resolveLead(dto.leadId);
    await this.ensureNoExistingClosure(lead.id);

    const resolved = await this.resolveRelations(dto, lead);
    const normalized = this.normalizePayload(dto, resolved.lead, resolved.vehicle);

    const sale = new SaleClosureEntity();
    Object.assign(sale, normalized, {
      leadId: resolved.lead.id,
      shopId: normalized.shopId ?? null,
      vehicleId: normalized.vehicleId ?? null,
      sellerId: normalized.sellerId ?? null,
      testDriveId: normalized.testDriveId ?? null,
    });

    const saved = await this.salesRepository.save(sale);
    await this.applyLeadOutcome(resolved.lead, saved);
    return this.findOne(saved.id);
  }

  async update(id: string, dto: UpdateSaleClosureDto) {
    const existing = await this.salesRepository.findOne({ where: { id } });
    if (!existing) throw new NotFoundException('Fechamento n�o encontrado.');

    const lead = await this.resolveLead(dto.leadId ?? existing.leadId);
    if (lead.id !== existing.leadId) {
      await this.ensureNoExistingClosure(lead.id, existing.id);
    }

    const resolved = await this.resolveRelations(
      {
        shopId: dto.shopId ?? existing.shopId,
        vehicleId: dto.vehicleId ?? existing.vehicleId,
        sellerId: dto.sellerId ?? existing.sellerId,
        testDriveId: dto.testDriveId ?? existing.testDriveId,
      },
      lead,
    );
    const normalized = this.normalizePayload({ ...existing, ...dto } as CreateSaleClosureDto, resolved.lead, resolved.vehicle);

    Object.assign(existing, normalized, {
      leadId: resolved.lead.id,
      shopId: normalized.shopId ?? null,
      vehicleId: normalized.vehicleId ?? null,
      sellerId: normalized.sellerId ?? null,
      testDriveId: normalized.testDriveId ?? null,
    });

    const saved = await this.salesRepository.save(existing);
    await this.applyLeadOutcome(resolved.lead, saved);
    return this.findOne(saved.id);
  }

  async remove(id: string) {
    const sale = await this.salesRepository.findOne({ where: { id } });
    if (!sale) throw new NotFoundException('Fechamento n�o encontrado.');

    await this.salesRepository.remove(sale);
    return { success: true };
  }

  private async resolveLead(leadId: string) {
    const lead = await this.leadsRepository.findOne({ where: { id: leadId } });
    if (!lead) throw new BadRequestException('Lead n�o encontrado.');
    return lead;
  }

  private async ensureNoExistingClosure(leadId: string, ignoreId?: string) {
    const existing = await this.salesRepository.findOne({ where: { leadId } });
    if (existing && existing.id !== ignoreId) {
      throw new BadRequestException('Este lead j� possui um fechamento registrado.');
    }
  }

  private async resolveRelations(
    dto: {
      shopId?: string | null;
      vehicleId?: string | null;
      sellerId?: string | null;
      testDriveId?: string | null;
    },
    lead: LeadEntity,
  ) {
    const shopId = dto.shopId ?? lead.shopId ?? null;
    const vehicleId = dto.vehicleId ?? lead.vehicleId ?? null;
    const sellerId = dto.sellerId ?? lead.sellerId ?? null;

    const shop = shopId ? await this.shopsRepository.findOne({ where: { id: shopId } }) : null;
    if (shopId && !shop) throw new BadRequestException('Loja n�o encontrada.');

    const vehicle = vehicleId ? await this.vehiclesRepository.findOne({ where: { id: vehicleId } }) : null;
    if (vehicleId && !vehicle) throw new BadRequestException('Ve�culo n�o encontrado.');

    const seller = sellerId ? await this.usersRepository.findOne({ where: { id: sellerId } }) : null;
    if (sellerId && !seller) throw new BadRequestException('Vendedor n�o encontrado.');

    const testDrive = dto.testDriveId
      ? await this.testDrivesRepository.findOne({ where: { id: dto.testDriveId } })
      : null;
    if (dto.testDriveId && !testDrive) throw new BadRequestException('Test drive n�o encontrado.');

    if (vehicle && shopId && vehicle.shopId !== shopId) {
      throw new BadRequestException('O ve�culo selecionado n�o pertence � loja informada.');
    }
    if (seller && shopId && seller.shopId && seller.shopId !== shopId) {
      throw new BadRequestException('O vendedor selecionado n�o pertence � loja informada.');
    }
    if (lead.shopId && shopId && lead.shopId !== shopId) {
      throw new BadRequestException('O lead informado n�o pertence � loja selecionada.');
    }
    if (lead.vehicleId && vehicleId && lead.vehicleId !== vehicleId) {
      throw new BadRequestException('O ve�culo informado diverge do ve�culo vinculado ao lead.');
    }
    if (testDrive && testDrive.leadId && testDrive.leadId !== lead.id) {
      throw new BadRequestException('O test drive informado n�o pertence ao lead selecionado.');
    }

    return { lead, shop, vehicle, seller, testDrive };
  }

  private normalizePayload(dto: Partial<CreateSaleClosureDto>, lead: LeadEntity, vehicle: VehicleEntity | null) {
    const closedAt = dto.closedAt ? new Date(dto.closedAt) : new Date();
    if (Number.isNaN(closedAt.getTime())) throw new BadRequestException('Data de fechamento inv�lida.');

    const listPrice = this.toNumber(dto.listPrice ?? vehicle?.price ?? null);
    let salePrice = this.toNumber(dto.salePrice ?? listPrice);
    let discountValue = this.toNumber(dto.discountValue ?? null);
    let discountPercent = this.toNumber(dto.discountPercent ?? null);

    if ((dto.outcomeType ?? SaleOutcomeType.NoSale) === SaleOutcomeType.Sale && salePrice === null) {
      throw new BadRequestException('Informe o valor final da venda.');
    }

    if (listPrice !== null && salePrice !== null) {
      if (discountValue === null) discountValue = Math.max(listPrice - salePrice, 0);
      if (discountPercent === null && listPrice > 0) discountPercent = Number(((discountValue / listPrice) * 100).toFixed(2));
    }

    if ((dto.outcomeType ?? SaleOutcomeType.NoSale) === SaleOutcomeType.NoSale) {
      salePrice = salePrice ?? null;
    }

    return {
      outcomeType: dto.outcomeType ?? SaleOutcomeType.NoSale,
      shopId: dto.shopId ?? lead.shopId ?? vehicle?.shopId ?? null,
      vehicleId: dto.vehicleId ?? lead.vehicleId ?? null,
      sellerId: dto.sellerId ?? lead.sellerId ?? null,
      testDriveId: dto.testDriveId ?? null,
      paymentMethod: dto.paymentMethod ?? null,
      giftType: dto.giftType ?? SaleGiftType.None,
      noSaleReason: dto.outcomeType === SaleOutcomeType.NoSale ? dto.noSaleReason ?? NoSaleReason.Other : null,
      listPrice,
      salePrice,
      discountValue,
      discountPercent,
      entryValue: this.toNumber(dto.entryValue ?? null),
      installments: dto.installments ?? null,
      commissionValue: this.toNumber(dto.commissionValue ?? null),
      tradeInAccepted: dto.tradeInAccepted ?? false,
      tradeInDescription: dto.tradeInDescription?.trim() || null,
      competitorName: dto.competitorName?.trim() || null,
      accessoryDescription: dto.accessoryDescription?.trim() || null,
      closedAt,
      notes: dto.notes?.trim() || null,
      metadata: null,
    };
  }

  private async applyLeadOutcome(lead: LeadEntity, sale: SaleClosureEntity) {
    lead.status = sale.outcomeType === SaleOutcomeType.Sale ? LeadStatus.Won : LeadStatus.Lost;
    lead.hasBeenContacted = true;
    lead.lastContactDate = sale.closedAt;
    lead.contactDate = lead.contactDate ?? sale.closedAt;
    await this.leadsRepository.save(lead);
  }

  private toResponse(sale: SaleClosureEntity) {
    const vehicleLabel = [sale.vehicle?.brand, sale.vehicle?.model, sale.vehicle?.version, sale.vehicle?.year]
      .filter(Boolean)
      .join(' ');

    return {
      id: sale.id,
      shopId: sale.shopId,
      leadId: sale.leadId,
      vehicleId: sale.vehicleId,
      sellerId: sale.sellerId,
      testDriveId: sale.testDriveId,
      outcomeType: sale.outcomeType,
      paymentMethod: sale.paymentMethod,
      giftType: sale.giftType,
      noSaleReason: sale.noSaleReason,
      listPrice: sale.listPrice !== null ? Number(sale.listPrice) : null,
      salePrice: sale.salePrice !== null ? Number(sale.salePrice) : null,
      discountValue: sale.discountValue !== null ? Number(sale.discountValue) : null,
      discountPercent: sale.discountPercent !== null ? Number(sale.discountPercent) : null,
      entryValue: sale.entryValue !== null ? Number(sale.entryValue) : null,
      installments: sale.installments,
      commissionValue: sale.commissionValue !== null ? Number(sale.commissionValue) : null,
      tradeInAccepted: sale.tradeInAccepted,
      tradeInDescription: sale.tradeInDescription,
      competitorName: sale.competitorName,
      accessoryDescription: sale.accessoryDescription,
      closedAt: sale.closedAt,
      notes: sale.notes,
      createdAt: sale.createdAt,
      updatedAt: sale.updatedAt,
      shopName: sale.shop?.name ?? null,
      lead: sale.lead
        ? {
            id: sale.lead.id,
            name: sale.lead.name,
            email: sale.lead.email,
            phone: sale.lead.phone,
            status: sale.lead.status,
          }
        : null,
      seller: sale.seller
        ? {
            id: sale.seller.id,
            userName: sale.seller.userName,
            email: sale.seller.email,
          }
        : null,
      vehicle: sale.vehicle
        ? {
            id: sale.vehicle.id,
            label: vehicleLabel,
            brand: sale.vehicle.brand,
            model: sale.vehicle.model,
            version: sale.vehicle.version,
            year: sale.vehicle.year,
            price: Number(sale.vehicle.price),
            mainPhotoUrl:
              sale.vehicle.thumbnailPhotoUrls?.[0]
              ?? sale.vehicle.originalPhotoUrls?.[0]
              ?? sale.vehicle.photoUrls?.[0]
              ?? null,
          }
        : null,
      testDrive: sale.testDrive
        ? {
            id: sale.testDrive.id,
            preferredDate: sale.testDrive.preferredDate,
            status: sale.testDrive.status,
          }
        : null,
    };
  }

  private buildSummary(items: SaleClosureEntity[]) {
    const total = items.length;
    const sales = items.filter((item) => item.outcomeType === SaleOutcomeType.Sale);
    const noSales = total - sales.length;
    const gross = sales.reduce((sum, item) => sum + Number(item.salePrice ?? 0), 0);
    const discounts = sales.reduce((sum, item) => sum + Number(item.discountValue ?? 0), 0);

    return {
      total,
      sales: sales.length,
      noSales,
      grossValue: gross,
      discountValue: discounts,
      averageTicket: sales.length ? Number((gross / sales.length).toFixed(2)) : 0,
    };
  }

  private mapEnum<T extends string>(values: Record<string, T>, labels: Record<string, string>) {
    return Object.values(values).map((value) => ({
      value,
      label: labels[value] ?? value,
    }));
  }

  private toNumber(value: unknown): number | null {
    if (value === null || value === undefined || value === '') return null;
    const normalized = Number(value);
    return Number.isFinite(normalized) ? normalized : null;
  }
}

