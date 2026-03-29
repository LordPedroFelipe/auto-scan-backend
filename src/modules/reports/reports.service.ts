import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LeadEntity } from '../leads/entities/lead.entity';
import { ShopEntity } from '../shops/entities/shop.entity';
import { TestDriveEntity } from '../test-drives/entities/test-drive.entity';
import { VehicleEntity } from '../vehicles/entities/vehicle.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(ShopEntity)
    private readonly shopsRepository: Repository<ShopEntity>,
    @InjectRepository(VehicleEntity)
    private readonly vehiclesRepository: Repository<VehicleEntity>,
    @InjectRepository(LeadEntity)
    private readonly leadsRepository: Repository<LeadEntity>,
    @InjectRepository(TestDriveEntity)
    private readonly testDrivesRepository: Repository<TestDriveEntity>,
  ) {}

  async shopReport(shopId: string, query: Record<string, string>) {
    const shop = await this.shopsRepository.findOne({ where: { id: shopId } });
    const [vehicles, leads, testDrives] = await Promise.all([
      this.vehiclesRepository.count({ where: { shopId } }),
      this.leadsRepository.count({ where: { shopId } }),
      this.testDrivesRepository.count({ where: { shopId } }),
    ]);

    return {
      shop,
      filters: query,
      summary: {
        vehicles,
        leads,
        testDrives,
      },
      generatedAt: new Date().toISOString(),
    };
  }
}
