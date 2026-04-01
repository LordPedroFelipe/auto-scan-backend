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
exports.TestDrivesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const lead_entity_1 = require("../leads/entities/lead.entity");
const shop_entity_1 = require("../shops/entities/shop.entity");
const vehicle_entity_1 = require("../vehicles/entities/vehicle.entity");
const test_drive_entity_1 = require("./entities/test-drive.entity");
let TestDrivesService = class TestDrivesService {
    constructor(testDrivesRepository, shopsRepository, vehiclesRepository, leadsRepository) {
        this.testDrivesRepository = testDrivesRepository;
        this.shopsRepository = shopsRepository;
        this.vehiclesRepository = vehiclesRepository;
        this.leadsRepository = leadsRepository;
    }
    async findAll(query = {}) {
        const pageNumber = query.PageNumber ?? query.pageNumber ?? 1;
        const pageSize = query.PageSize ?? query.pageSize ?? 10;
        const customerName = query.CustomerName ?? query.customerName;
        const vehicleModel = query.VehicleModel ?? query.vehicleModel;
        const status = query.Status ?? query.status;
        const shopId = query.ShopId ?? query.shopId;
        const qb = this.testDrivesRepository
            .createQueryBuilder('testDrive')
            .leftJoinAndSelect('testDrive.shop', 'shop')
            .leftJoinAndSelect('testDrive.vehicle', 'vehicle')
            .leftJoinAndSelect('testDrive.lead', 'lead');
        if (shopId) {
            qb.andWhere('testDrive.shopId = :shopId', { shopId });
        }
        if (customerName) {
            qb.andWhere('testDrive.customerName ILIKE :customerName', {
                customerName: `%${customerName}%`,
            });
        }
        if (vehicleModel) {
            qb.andWhere('(vehicle.model ILIKE :vehicleModel OR vehicle.brand ILIKE :vehicleModel OR vehicle.version ILIKE :vehicleModel)', { vehicleModel: `%${vehicleModel}%` });
        }
        if (status) {
            qb.andWhere('testDrive.status = :status', { status });
        }
        qb.orderBy('testDrive.createdAt', 'DESC');
        qb.skip((pageNumber - 1) * pageSize);
        qb.take(pageSize);
        const [items, totalCount] = await qb.getManyAndCount();
        return {
            items: items.map((item) => this.toResponse(item)),
            pageNumber,
            pageSize,
            totalCount,
            totalPages: Math.ceil(totalCount / pageSize) || 1,
        };
    }
    async findOne(id) {
        const testDrive = await this.testDrivesRepository.findOne({
            where: { id },
            relations: {
                shop: true,
                vehicle: true,
                lead: true,
            },
        });
        if (!testDrive) {
            throw new common_1.NotFoundException('Test drive não encontrado.');
        }
        return this.toResponse(testDrive);
    }
    async create(dto) {
        const vehicle = await this.vehiclesRepository.findOne({
            where: { id: dto.vehicleId },
            relations: {
                shop: true,
            },
        });
        if (!vehicle) {
            throw new common_1.BadRequestException('Veículo não encontrado.');
        }
        if (dto.shopId) {
            const shop = await this.shopsRepository.findOne({ where: { id: dto.shopId } });
            if (!shop)
                throw new common_1.BadRequestException('Loja não encontrada.');
        }
        if (dto.leadId) {
            const lead = await this.leadsRepository.findOne({ where: { id: dto.leadId } });
            if (!lead)
                throw new common_1.BadRequestException('Lead não encontrado.');
        }
        const leadId = dto.leadId ?? (await this.ensureLeadForTestDrive(dto, vehicle));
        const testDrive = this.testDrivesRepository.create({
            ...dto,
            shopId: dto.shopId ?? vehicle.shopId ?? null,
            leadId,
            customerEmail: dto.customerEmail?.toLowerCase() ?? null,
            customerPhone: dto.customerPhone ?? null,
            preferredTime: dto.preferredTime ?? null,
            notes: dto.notes ?? null,
            preferredDate: new Date(dto.preferredDate),
            status: dto.status ?? test_drive_entity_1.TestDriveStatus.Pending,
        });
        const savedTestDrive = await this.testDrivesRepository.save(testDrive);
        return this.findOne(savedTestDrive.id);
    }
    async update(id, dto) {
        const testDrive = await this.testDrivesRepository.findOne({ where: { id } });
        if (!testDrive) {
            throw new common_1.NotFoundException('Test drive não encontrado.');
        }
        Object.assign(testDrive, dto);
        if (dto.preferredDate) {
            testDrive.preferredDate = new Date(dto.preferredDate);
        }
        if (dto.customerEmail) {
            testDrive.customerEmail = dto.customerEmail.toLowerCase();
        }
        const savedTestDrive = await this.testDrivesRepository.save(testDrive);
        return this.findOne(savedTestDrive.id);
    }
    async remove(id) {
        const testDrive = await this.testDrivesRepository.findOne({ where: { id } });
        if (!testDrive) {
            throw new common_1.NotFoundException('Test drive não encontrado.');
        }
        await this.testDrivesRepository.remove(testDrive);
        return { success: true };
    }
    async ensureLeadForTestDrive(dto, vehicle) {
        const normalizedEmail = dto.customerEmail?.toLowerCase() ?? null;
        const normalizedPhone = dto.customerPhone?.trim() ?? null;
        const scheduledAt = new Date(dto.preferredDate);
        const leadNotes = [
            'Origem: agendamento de test drive',
            `Veículo: ${vehicle.brand} ${vehicle.model} ${vehicle.version ?? ''} ${vehicle.year}`.trim(),
            `Data preferida: ${scheduledAt.toISOString()}`,
            dto.preferredTime ? `Horário preferido: ${dto.preferredTime}` : null,
            dto.notes ? `Observações: ${dto.notes}` : null,
        ]
            .filter(Boolean)
            .join('\n');
        const existingLead = await this.findRecentLeadForVehicle(dto.vehicleId, normalizedEmail, normalizedPhone);
        if (existingLead) {
            existingLead.notes = [existingLead.notes, leadNotes]
                .filter(Boolean)
                .join('\n\n');
            existingLead.origin = existingLead.origin ?? 'Agendamento Test Drive';
            existingLead.status = existingLead.status ?? lead_entity_1.LeadStatus.New;
            const savedLead = await this.leadsRepository.save(existingLead);
            return savedLead.id;
        }
        const lead = this.leadsRepository.create({
            name: dto.customerName,
            email: normalizedEmail,
            phone: normalizedPhone,
            city: vehicle.city ?? null,
            origin: 'Agendamento Test Drive',
            notes: leadNotes,
            status: lead_entity_1.LeadStatus.New,
            hasBeenContacted: false,
            contactDate: null,
            lastContactDate: null,
            isActive: true,
            shopId: dto.shopId ?? vehicle.shopId ?? null,
            vehicleId: dto.vehicleId,
            sellerId: null,
        });
        const savedLead = await this.leadsRepository.save(lead);
        return savedLead.id;
    }
    async findRecentLeadForVehicle(vehicleId, email, phone) {
        if (!email && !phone) {
            return null;
        }
        const qb = this.leadsRepository
            .createQueryBuilder('lead')
            .where('lead.vehicleId = :vehicleId', { vehicleId })
            .orderBy('lead.createdAt', 'DESC')
            .take(1);
        if (email && phone) {
            qb.andWhere('(LOWER(lead.email) = LOWER(:email) OR lead.phone = :phone)', {
                email,
                phone,
            });
        }
        else if (email) {
            qb.andWhere('LOWER(lead.email) = LOWER(:email)', { email });
        }
        else if (phone) {
            qb.andWhere('lead.phone = :phone', { phone });
        }
        return qb.getOne();
    }
    toResponse(testDrive) {
        return {
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
            shopName: testDrive.shop?.name ?? testDrive.vehicle?.shop?.name ?? null,
            lead: testDrive.lead
                ? {
                    id: testDrive.lead.id,
                    name: testDrive.lead.name,
                    email: testDrive.lead.email,
                    phone: testDrive.lead.phone,
                }
                : null,
        };
    }
};
exports.TestDrivesService = TestDrivesService;
exports.TestDrivesService = TestDrivesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(test_drive_entity_1.TestDriveEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(shop_entity_1.ShopEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(vehicle_entity_1.VehicleEntity)),
    __param(3, (0, typeorm_1.InjectRepository)(lead_entity_1.LeadEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], TestDrivesService);
