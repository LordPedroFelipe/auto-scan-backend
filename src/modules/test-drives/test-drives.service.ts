import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LeadEntity, LeadStatus } from '../leads/entities/lead.entity';
import { ShopEntity } from '../shops/entities/shop.entity';
import { VehicleEntity } from '../vehicles/entities/vehicle.entity';
import { CreateTestDriveDto } from './dto/create-test-drive.dto';
import { TestDrivesQueryDto } from './dto/test-drives-query.dto';
import { UpdateTestDriveDto } from './dto/update-test-drive.dto';
import { TestDriveEntity, TestDriveStatus } from './entities/test-drive.entity';

@Injectable()
export class TestDrivesService {
  constructor(
    @InjectRepository(TestDriveEntity)
    private readonly testDrivesRepository: Repository<TestDriveEntity>,
    @InjectRepository(ShopEntity)
    private readonly shopsRepository: Repository<ShopEntity>,
    @InjectRepository(VehicleEntity)
    private readonly vehiclesRepository: Repository<VehicleEntity>,
    @InjectRepository(LeadEntity)
    private readonly leadsRepository: Repository<LeadEntity>,
  ) {}

  async findAll(query: TestDrivesQueryDto = {}) {
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
      qb.andWhere(
        '(vehicle.model ILIKE :vehicleModel OR vehicle.brand ILIKE :vehicleModel OR vehicle.version ILIKE :vehicleModel)',
        { vehicleModel: `%${vehicleModel}%` },
      );
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

  async findOne(id: string) {
    const testDrive = await this.testDrivesRepository.findOne({
      where: { id },
      relations: {
        shop: true,
        vehicle: true,
        lead: true,
      },
    });

    if (!testDrive) {
      throw new NotFoundException('Test drive não encontrado.');
    }

    return this.toResponse(testDrive);
  }

  async create(dto: CreateTestDriveDto) {
    const vehicle = await this.vehiclesRepository.findOne({
      where: { id: dto.vehicleId },
      relations: {
        shop: true,
      },
    });
    if (!vehicle) {
      throw new BadRequestException('Veículo não encontrado.');
    }

    if (dto.shopId) {
      const shop = await this.shopsRepository.findOne({ where: { id: dto.shopId } });
      if (!shop) throw new BadRequestException('Loja não encontrada.');
    }

    if (dto.leadId) {
      const lead = await this.leadsRepository.findOne({ where: { id: dto.leadId } });
      if (!lead) throw new BadRequestException('Lead não encontrado.');
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
      status: dto.status ?? TestDriveStatus.Pending,
    });

    const savedTestDrive = await this.testDrivesRepository.save(testDrive);
    return this.findOne(savedTestDrive.id);
  }

  async update(id: string, dto: UpdateTestDriveDto) {
    const testDrive = await this.testDrivesRepository.findOne({ where: { id } });
    if (!testDrive) {
      throw new NotFoundException('Test drive não encontrado.');
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

  async remove(id: string) {
    const testDrive = await this.testDrivesRepository.findOne({ where: { id } });
    if (!testDrive) {
      throw new NotFoundException('Test drive não encontrado.');
    }

    await this.testDrivesRepository.remove(testDrive);
    return { success: true };
  }

  private async ensureLeadForTestDrive(
    dto: CreateTestDriveDto,
    vehicle: VehicleEntity,
  ) {
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

    const existingLead = await this.findRecentLeadForVehicle(
      dto.vehicleId,
      normalizedEmail,
      normalizedPhone,
    );

    if (existingLead) {
      existingLead.notes = [existingLead.notes, leadNotes]
        .filter(Boolean)
        .join('\n\n');
      existingLead.origin = existingLead.origin ?? 'Agendamento Test Drive';
      existingLead.status = existingLead.status ?? LeadStatus.New;
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
      status: LeadStatus.New,
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

  private async findRecentLeadForVehicle(
    vehicleId: string,
    email: string | null,
    phone: string | null,
  ) {
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
    } else if (email) {
      qb.andWhere('LOWER(lead.email) = LOWER(:email)', { email });
    } else if (phone) {
      qb.andWhere('lead.phone = :phone', { phone });
    }

    return qb.getOne();
  }

  private toResponse(testDrive: TestDriveEntity) {
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
      vehicleMainPhotoUrl:
        testDrive.vehicle?.thumbnailPhotoUrls?.[0]
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
}
