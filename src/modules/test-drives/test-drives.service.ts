import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LeadEntity } from '../leads/entities/lead.entity';
import { ShopEntity } from '../shops/entities/shop.entity';
import { VehicleEntity } from '../vehicles/entities/vehicle.entity';
import { CreateTestDriveDto } from './dto/create-test-drive.dto';
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

  findAll() {
    return this.testDrivesRepository.find({
      relations: {
        shop: true,
        vehicle: true,
        lead: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });
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

    return testDrive;
  }

  async create(dto: CreateTestDriveDto) {
    const vehicle = await this.vehiclesRepository.findOne({ where: { id: dto.vehicleId } });
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

    const testDrive = this.testDrivesRepository.create({
      ...dto,
      shopId: dto.shopId ?? vehicle.shopId ?? null,
      leadId: dto.leadId ?? null,
      customerEmail: dto.customerEmail ?? null,
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
    const testDrive = await this.findOne(id);
    Object.assign(testDrive, dto);
    if (dto.preferredDate) {
      testDrive.preferredDate = new Date(dto.preferredDate);
    }
    const savedTestDrive = await this.testDrivesRepository.save(testDrive);
    return this.findOne(savedTestDrive.id);
  }

  async remove(id: string) {
    const testDrive = await this.findOne(id);
    await this.testDrivesRepository.remove(testDrive);
    return { success: true };
  }
}
