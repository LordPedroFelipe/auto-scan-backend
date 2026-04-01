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
exports.LeadsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const lead_note_entity_1 = require("../lead-notes/entities/lead-note.entity");
const sale_closure_entity_1 = require("../sales/entities/sale-closure.entity");
const shop_entity_1 = require("../shops/entities/shop.entity");
const test_drive_entity_1 = require("../test-drives/entities/test-drive.entity");
const user_entity_1 = require("../users/entities/user.entity");
const vehicle_entity_1 = require("../vehicles/entities/vehicle.entity");
const lead_entity_1 = require("./entities/lead.entity");
let LeadsService = class LeadsService {
    constructor(leadsRepository, shopsRepository, vehiclesRepository, usersRepository, leadNotesRepository, testDrivesRepository, saleClosuresRepository) {
        this.leadsRepository = leadsRepository;
        this.shopsRepository = shopsRepository;
        this.vehiclesRepository = vehiclesRepository;
        this.usersRepository = usersRepository;
        this.leadNotesRepository = leadNotesRepository;
        this.testDrivesRepository = testDrivesRepository;
        this.saleClosuresRepository = saleClosuresRepository;
    }
    async findAll(query) {
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
        if (shopId)
            qb.andWhere('lead.shopId = :shopId', { shopId });
        if (query.CustomerName)
            qb.andWhere('lead.name ILIKE :name', { name: `%${query.CustomerName}%` });
        if (query.CustomerEmail)
            qb.andWhere('lead.email ILIKE :email', { email: `%${query.CustomerEmail}%` });
        if (query.CustomerPhone)
            qb.andWhere('lead.phone ILIKE :phone', { phone: `%${query.CustomerPhone}%` });
        if (query.CustomerCity)
            qb.andWhere('lead.city ILIKE :city', { city: `%${query.CustomerCity}%` });
        if (query.Origin)
            qb.andWhere('lead.origin ILIKE :origin', { origin: `%${query.Origin}%` });
        if (query.Status)
            qb.andWhere('lead.status = :status', { status: query.Status });
        if (query.SellerId)
            qb.andWhere('lead.sellerId = :sellerId', { sellerId: query.SellerId });
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
        return Object.values(lead_entity_1.LeadStatus).map((name, index) => ({
            id: index,
            name,
        }));
    }
    async findOne(id) {
        const lead = await this.leadsRepository.findOne({
            where: { id },
            relations: {
                shop: true,
                vehicle: true,
                seller: true,
            },
        });
        if (!lead) {
            throw new common_1.NotFoundException('Lead não encontrado.');
        }
        return lead;
    }
    async create(dto, request) {
        const { shopId, vehicleId } = await this.resolveShopAndVehicle(dto.shopId, dto.vehicleId);
        await this.ensureRelations(shopId, vehicleId, dto.sellerId);
        // Parse UTM parameters and referrer for automatic origin tracking
        const utmParams = this.parseUtmParams(request);
        const referrer = this.parseReferrer(request);
        // Auto-detect origin if not provided
        let originSource = dto.originSource ?? utmParams.source;
        let originMedium = dto.originMedium ?? utmParams.medium;
        let originCampaign = dto.originCampaign ?? utmParams.campaign;
        let originReferrer = dto.originReferrer ?? referrer;
        let originUtmParams = dto.originUtmParams ?? (Object.keys(utmParams).length > 0 ? utmParams : null);
        // If origin is not set and we have UTM data, set a default origin
        let origin = dto.origin;
        if (!origin && (originSource || originMedium || originCampaign)) {
            origin = 'Marketing Digital';
        }
        const lead = this.leadsRepository.create({
            ...dto,
            email: dto.email?.toLowerCase() ?? null,
            city: dto.city ?? null,
            origin: this.resolveLeadOrigin(origin, 'CRM Manual'),
            originSource,
            originMedium,
            originCampaign,
            originReferrer,
            originUtmParams,
            notes: dto.notes ?? null,
            status: dto.status ?? lead_entity_1.LeadStatus.New,
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
    async update(id, dto) {
        const lead = await this.findOne(id);
        const { shopId, vehicleId } = await this.resolveShopAndVehicle(dto.shopId ?? lead.shopId, dto.vehicleId ?? lead.vehicleId);
        await this.ensureRelations(shopId, vehicleId, dto.sellerId);
        Object.assign(lead, dto);
        if (dto.contactDate)
            lead.contactDate = new Date(dto.contactDate);
        if (dto.lastContactDate)
            lead.lastContactDate = new Date(dto.lastContactDate);
        if (dto.email)
            lead.email = dto.email.toLowerCase();
        if (dto.origin !== undefined)
            lead.origin = dto.origin?.trim() ?? null;
        lead.shopId = shopId;
        lead.vehicleId = vehicleId;
        const savedLead = await this.leadsRepository.save(lead);
        return this.findOne(savedLead.id);
    }
    async remove(id) {
        const lead = await this.findOne(id);
        await this.leadsRepository.remove(lead);
        return { success: true };
    }
    async crmDetail(id) {
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
                        title: saleClosure.outcomeType === sale_closure_entity_1.SaleOutcomeType.Sale ? 'Venda registrada' : 'Nao venda registrada',
                        description: saleClosure.notes || saleClosure.noSaleReason || 'Decisao final do lead registrada.',
                        occurredAt: saleClosure.closedAt,
                        tone: saleClosure.outcomeType === sale_closure_entity_1.SaleOutcomeType.Sale ? 'forest' : 'danger',
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
                lastInteractionAt: timeline[0]?.occurredAt?.toISOString?.()
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
                vehicleMainPhotoUrl: testDrive.vehicle?.thumbnailPhotoUrls?.[0]
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
                            mainPhotoUrl: saleClosure.vehicle.thumbnailPhotoUrls?.[0]
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
    async ensureRelations(shopId, vehicleId, sellerId) {
        if (shopId) {
            const shop = await this.shopsRepository.findOne({ where: { id: shopId } });
            if (!shop)
                throw new common_1.BadRequestException('Loja não encontrada.');
        }
        if (vehicleId) {
            const vehicle = await this.vehiclesRepository.findOne({ where: { id: vehicleId } });
            if (!vehicle)
                throw new common_1.BadRequestException('Veículo não encontrado.');
        }
        if (sellerId) {
            const seller = await this.usersRepository.findOne({ where: { id: sellerId } });
            if (!seller)
                throw new common_1.BadRequestException('Usuário vendedor não encontrado.');
        }
    }
    async resolveShopAndVehicle(shopId, vehicleId) {
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
            throw new common_1.BadRequestException('Veículo não encontrado.');
        }
        if (shopId && vehicle.shopId && shopId !== vehicle.shopId) {
            throw new common_1.BadRequestException('O veículo informado pertence a outra loja.');
        }
        return {
            shopId: shopId ?? vehicle.shopId ?? null,
            vehicleId,
        };
    }
    parseUtmParams(request) {
        if (!request?.query)
            return {};
        const utmParams = {};
        const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
        for (const key of utmKeys) {
            if (request.query[key]) {
                utmParams[key.replace('utm_', '')] = request.query[key];
            }
        }
        return utmParams;
    }
    parseReferrer(request) {
        if (!request?.headers?.referer)
            return null;
        const referrer = request.headers.referer;
        // Extract domain from referrer URL
        try {
            const url = new URL(referrer);
            return url.hostname;
        }
        catch {
            return referrer; // fallback to full referrer if parsing fails
        }
    }
    resolveLeadOrigin(origin, fallback = 'CRM Manual') {
        const normalized = origin?.trim();
        return normalized ? normalized : fallback;
    }
};
exports.LeadsService = LeadsService;
exports.LeadsService = LeadsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(lead_entity_1.LeadEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(shop_entity_1.ShopEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(vehicle_entity_1.VehicleEntity)),
    __param(3, (0, typeorm_1.InjectRepository)(user_entity_1.UserEntity)),
    __param(4, (0, typeorm_1.InjectRepository)(lead_note_entity_1.LeadNoteEntity)),
    __param(5, (0, typeorm_1.InjectRepository)(test_drive_entity_1.TestDriveEntity)),
    __param(6, (0, typeorm_1.InjectRepository)(sale_closure_entity_1.SaleClosureEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], LeadsService);
