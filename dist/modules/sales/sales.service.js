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
exports.SalesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const lead_entity_1 = require("../leads/entities/lead.entity");
const shop_entity_1 = require("../shops/entities/shop.entity");
const test_drive_entity_1 = require("../test-drives/entities/test-drive.entity");
const user_entity_1 = require("../users/entities/user.entity");
const vehicle_entity_1 = require("../vehicles/entities/vehicle.entity");
const sale_closure_entity_1 = require("./entities/sale-closure.entity");
let SalesService = class SalesService {
    constructor(salesRepository, leadsRepository, shopsRepository, vehiclesRepository, usersRepository, testDrivesRepository) {
        this.salesRepository = salesRepository;
        this.leadsRepository = leadsRepository;
        this.shopsRepository = shopsRepository;
        this.vehiclesRepository = vehiclesRepository;
        this.usersRepository = usersRepository;
        this.testDrivesRepository = testDrivesRepository;
    }
    getOptions() {
        return {
            outcomeTypes: this.mapEnum(sale_closure_entity_1.SaleOutcomeType, {
                [sale_closure_entity_1.SaleOutcomeType.Sale]: 'Venda',
                [sale_closure_entity_1.SaleOutcomeType.NoSale]: 'Nao venda',
            }),
            paymentMethods: this.mapEnum(sale_closure_entity_1.PaymentMethod, {
                [sale_closure_entity_1.PaymentMethod.Cash]: 'A vista',
                [sale_closure_entity_1.PaymentMethod.Financing]: 'Financiamento',
                [sale_closure_entity_1.PaymentMethod.Consorcio]: 'Consorcio',
                [sale_closure_entity_1.PaymentMethod.Pix]: 'Pix',
                [sale_closure_entity_1.PaymentMethod.BankTransfer]: 'Transferencia',
                [sale_closure_entity_1.PaymentMethod.CreditCard]: 'Cartao',
                [sale_closure_entity_1.PaymentMethod.TradeIn]: 'Troca',
                [sale_closure_entity_1.PaymentMethod.Other]: 'Outro',
            }),
            giftTypes: this.mapEnum(sale_closure_entity_1.SaleGiftType, {
                [sale_closure_entity_1.SaleGiftType.None]: 'Sem brinde',
                [sale_closure_entity_1.SaleGiftType.FuelTank]: 'Tanque cheio',
                [sale_closure_entity_1.SaleGiftType.Documentation]: 'Documentacao',
                [sale_closure_entity_1.SaleGiftType.Warranty]: 'Garantia',
                [sale_closure_entity_1.SaleGiftType.AccessoryKit]: 'Kit de acessorios',
                [sale_closure_entity_1.SaleGiftType.ProtectionFilm]: 'Pel�cula / protecao',
                [sale_closure_entity_1.SaleGiftType.InsuranceBonus]: 'Bonus no seguro',
                [sale_closure_entity_1.SaleGiftType.ServicePackage]: 'Pacote de servicos',
                [sale_closure_entity_1.SaleGiftType.Other]: 'Outro',
            }),
            noSaleReasons: this.mapEnum(sale_closure_entity_1.NoSaleReason, {
                [sale_closure_entity_1.NoSaleReason.Price]: 'Preco',
                [sale_closure_entity_1.NoSaleReason.CreditDenied]: 'Credito negado',
                [sale_closure_entity_1.NoSaleReason.ChoseCompetitor]: 'Escolheu concorrente',
                [sale_closure_entity_1.NoSaleReason.NoContact]: 'Sem contato',
                [sale_closure_entity_1.NoSaleReason.StockUnavailable]: 'Estoque indisponivel',
                [sale_closure_entity_1.NoSaleReason.PostponedDecision]: 'Decisao adiada',
                [sale_closure_entity_1.NoSaleReason.VehicleMismatch]: 'Veiculo nao aderente',
                [sale_closure_entity_1.NoSaleReason.Other]: 'Outro',
                [sale_closure_entity_1.NoSaleReason.NotInformed]: 'Nao informado',
            }),
        };
    }
    async findAll(query = {}) {
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
        if (query.shopId)
            qb.andWhere('sale.shopId = :shopId', { shopId: query.shopId });
        if (query.leadId)
            qb.andWhere('sale.leadId = :leadId', { leadId: query.leadId });
        if (query.sellerId)
            qb.andWhere('sale.sellerId = :sellerId', { sellerId: query.sellerId });
        if (query.outcomeType)
            qb.andWhere('sale.outcomeType = :outcomeType', { outcomeType: query.outcomeType });
        if (query.noSaleReason)
            qb.andWhere('sale.noSaleReason = :noSaleReason', { noSaleReason: query.noSaleReason });
        if (query.giftType)
            qb.andWhere('sale.giftType = :giftType', { giftType: query.giftType });
        if (query.customerName) {
            qb.andWhere('(lead.name ILIKE :customerName OR lead.email ILIKE :customerName OR lead.phone ILIKE :customerName)', {
                customerName: `%${query.customerName}%`,
            });
        }
        if (query.closedFrom)
            qb.andWhere('sale.closedAt >= :closedFrom', { closedFrom: new Date(query.closedFrom) });
        if (query.closedTo)
            qb.andWhere('sale.closedAt <= :closedTo', { closedTo: new Date(query.closedTo) });
        const sortableMap = {
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
    async findOne(id) {
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
        if (!sale)
            throw new common_1.NotFoundException('Fechamento n�o encontrado.');
        return this.toResponse(sale);
    }
    async create(dto) {
        const lead = await this.resolveLead(dto.leadId);
        await this.ensureNoExistingClosure(lead.id);
        const resolved = await this.resolveRelations(dto, lead);
        const normalized = this.normalizePayload(dto, resolved.lead, resolved.vehicle);
        const sale = new sale_closure_entity_1.SaleClosureEntity();
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
    async update(id, dto) {
        const existing = await this.salesRepository.findOne({ where: { id } });
        if (!existing)
            throw new common_1.NotFoundException('Fechamento n�o encontrado.');
        const lead = await this.resolveLead(dto.leadId ?? existing.leadId);
        if (lead.id !== existing.leadId) {
            await this.ensureNoExistingClosure(lead.id, existing.id);
        }
        const resolved = await this.resolveRelations({
            shopId: dto.shopId ?? existing.shopId,
            vehicleId: dto.vehicleId ?? existing.vehicleId,
            sellerId: dto.sellerId ?? existing.sellerId,
            testDriveId: dto.testDriveId ?? existing.testDriveId,
        }, lead);
        const normalized = this.normalizePayload({ ...existing, ...dto }, resolved.lead, resolved.vehicle);
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
    async remove(id) {
        const sale = await this.salesRepository.findOne({ where: { id } });
        if (!sale)
            throw new common_1.NotFoundException('Fechamento n�o encontrado.');
        await this.salesRepository.remove(sale);
        return { success: true };
    }
    async resolveLead(leadId) {
        const lead = await this.leadsRepository.findOne({ where: { id: leadId } });
        if (!lead)
            throw new common_1.BadRequestException('Lead n�o encontrado.');
        return lead;
    }
    async ensureNoExistingClosure(leadId, ignoreId) {
        const existing = await this.salesRepository.findOne({ where: { leadId } });
        if (existing && existing.id !== ignoreId) {
            throw new common_1.BadRequestException('Este lead j� possui um fechamento registrado.');
        }
    }
    async resolveRelations(dto, lead) {
        const shopId = dto.shopId ?? lead.shopId ?? null;
        const vehicleId = dto.vehicleId ?? lead.vehicleId ?? null;
        const sellerId = dto.sellerId ?? lead.sellerId ?? null;
        const shop = shopId ? await this.shopsRepository.findOne({ where: { id: shopId } }) : null;
        if (shopId && !shop)
            throw new common_1.BadRequestException('Loja n�o encontrada.');
        const vehicle = vehicleId ? await this.vehiclesRepository.findOne({ where: { id: vehicleId } }) : null;
        if (vehicleId && !vehicle)
            throw new common_1.BadRequestException('Ve�culo n�o encontrado.');
        const seller = sellerId ? await this.usersRepository.findOne({ where: { id: sellerId } }) : null;
        if (sellerId && !seller)
            throw new common_1.BadRequestException('Vendedor n�o encontrado.');
        const testDrive = dto.testDriveId
            ? await this.testDrivesRepository.findOne({ where: { id: dto.testDriveId } })
            : null;
        if (dto.testDriveId && !testDrive)
            throw new common_1.BadRequestException('Test drive n�o encontrado.');
        if (vehicle && shopId && vehicle.shopId !== shopId) {
            throw new common_1.BadRequestException('O ve�culo selecionado n�o pertence � loja informada.');
        }
        if (seller && shopId && seller.shopId && seller.shopId !== shopId) {
            throw new common_1.BadRequestException('O vendedor selecionado n�o pertence � loja informada.');
        }
        if (lead.shopId && shopId && lead.shopId !== shopId) {
            throw new common_1.BadRequestException('O lead informado n�o pertence � loja selecionada.');
        }
        if (lead.vehicleId && vehicleId && lead.vehicleId !== vehicleId) {
            throw new common_1.BadRequestException('O ve�culo informado diverge do ve�culo vinculado ao lead.');
        }
        if (testDrive && testDrive.leadId && testDrive.leadId !== lead.id) {
            throw new common_1.BadRequestException('O test drive informado n�o pertence ao lead selecionado.');
        }
        return { lead, shop, vehicle, seller, testDrive };
    }
    normalizePayload(dto, lead, vehicle) {
        const closedAt = dto.closedAt ? new Date(dto.closedAt) : new Date();
        if (Number.isNaN(closedAt.getTime()))
            throw new common_1.BadRequestException('Data de fechamento inv�lida.');
        const listPrice = this.toNumber(dto.listPrice ?? vehicle?.price ?? null);
        let salePrice = this.toNumber(dto.salePrice ?? listPrice);
        let discountValue = this.toNumber(dto.discountValue ?? null);
        let discountPercent = this.toNumber(dto.discountPercent ?? null);
        if ((dto.outcomeType ?? sale_closure_entity_1.SaleOutcomeType.NoSale) === sale_closure_entity_1.SaleOutcomeType.Sale && salePrice === null) {
            throw new common_1.BadRequestException('Informe o valor final da venda.');
        }
        if (listPrice !== null && salePrice !== null) {
            if (discountValue === null)
                discountValue = Math.max(listPrice - salePrice, 0);
            if (discountPercent === null && listPrice > 0)
                discountPercent = Number(((discountValue / listPrice) * 100).toFixed(2));
        }
        if ((dto.outcomeType ?? sale_closure_entity_1.SaleOutcomeType.NoSale) === sale_closure_entity_1.SaleOutcomeType.NoSale) {
            salePrice = salePrice ?? null;
        }
        return {
            outcomeType: dto.outcomeType ?? sale_closure_entity_1.SaleOutcomeType.NoSale,
            shopId: dto.shopId ?? lead.shopId ?? vehicle?.shopId ?? null,
            vehicleId: dto.vehicleId ?? lead.vehicleId ?? null,
            sellerId: dto.sellerId ?? lead.sellerId ?? null,
            testDriveId: dto.testDriveId ?? null,
            paymentMethod: dto.paymentMethod ?? null,
            giftType: dto.giftType ?? sale_closure_entity_1.SaleGiftType.None,
            noSaleReason: dto.outcomeType === sale_closure_entity_1.SaleOutcomeType.NoSale ? dto.noSaleReason ?? sale_closure_entity_1.NoSaleReason.Other : null,
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
    async applyLeadOutcome(lead, sale) {
        lead.status = sale.outcomeType === sale_closure_entity_1.SaleOutcomeType.Sale ? lead_entity_1.LeadStatus.Won : lead_entity_1.LeadStatus.Lost;
        lead.hasBeenContacted = true;
        lead.lastContactDate = sale.closedAt;
        lead.contactDate = lead.contactDate ?? sale.closedAt;
        await this.leadsRepository.save(lead);
    }
    toResponse(sale) {
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
                    mainPhotoUrl: sale.vehicle.thumbnailPhotoUrls?.[0]
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
    buildSummary(items) {
        const total = items.length;
        const sales = items.filter((item) => item.outcomeType === sale_closure_entity_1.SaleOutcomeType.Sale);
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
    mapEnum(values, labels) {
        return Object.values(values).map((value) => ({
            value,
            label: labels[value] ?? value,
        }));
    }
    toNumber(value) {
        if (value === null || value === undefined || value === '')
            return null;
        const normalized = Number(value);
        return Number.isFinite(normalized) ? normalized : null;
    }
};
exports.SalesService = SalesService;
exports.SalesService = SalesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(sale_closure_entity_1.SaleClosureEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(lead_entity_1.LeadEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(shop_entity_1.ShopEntity)),
    __param(3, (0, typeorm_1.InjectRepository)(vehicle_entity_1.VehicleEntity)),
    __param(4, (0, typeorm_1.InjectRepository)(user_entity_1.UserEntity)),
    __param(5, (0, typeorm_1.InjectRepository)(test_drive_entity_1.TestDriveEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], SalesService);
