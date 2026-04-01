import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SaleClosureEntity, SaleOutcomeType } from '../sales/entities/sale-closure.entity';
import { ShopEntity } from '../shops/entities/shop.entity';
import { UserEntity } from '../users/entities/user.entity';
import { CreateSalesGoalDto } from './dto/create-sales-goal.dto';
import { SalesGoalsQueryDto } from './dto/create-sales-goal.dto';
import { UpdateSalesGoalDto } from './dto/create-sales-goal.dto';
import { SalesGoalEntity, SalesGoalType } from './entities/sales-goal.entity';

@Injectable()
export class SalesGoalsService {
  constructor(
    @InjectRepository(SalesGoalEntity)
    private readonly salesGoalsRepository: Repository<SalesGoalEntity>,
    @InjectRepository(ShopEntity)
    private readonly shopsRepository: Repository<ShopEntity>,
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    @InjectRepository(SaleClosureEntity)
    private readonly saleClosuresRepository: Repository<SaleClosureEntity>,
  ) {}

  async create(dto: CreateSalesGoalDto, shopId: string) {
    // Validate shop exists
    const shop = await this.shopsRepository.findOne({ where: { id: shopId } });
    if (!shop) {
      throw new NotFoundException('Loja não encontrada');
    }

    // Validate seller if provided
    if (dto.sellerId) {
      const seller = await this.usersRepository.findOne({ where: { id: dto.sellerId } });
      if (!seller) {
        throw new NotFoundException('Vendedor não encontrado');
      }
    }

    const goal = this.salesGoalsRepository.create({
      ...dto,
      shopId,
      isActive: true,
      currentValue: 0,
      startDate: dto.type === SalesGoalType.Campaign ? new Date(dto.year, dto.month - 1, 1) : null,
      endDate: dto.type === SalesGoalType.Campaign ? new Date(dto.year, dto.month, 0) : null,
    });

    return this.salesGoalsRepository.save(goal);
  }

  async findAll(query: SalesGoalsQueryDto, shopId?: string) {
    const qb = this.salesGoalsRepository
      .createQueryBuilder('goal')
      .leftJoinAndSelect('goal.shop', 'shop')
      .leftJoinAndSelect('goal.seller', 'seller');

    if (shopId) {
      qb.andWhere('goal.shopId = :shopId', { shopId });
    }

    if (query.year) {
      qb.andWhere('goal.year = :year', { year: parseInt(query.year) });
    }

    if (query.month) {
      qb.andWhere('goal.month = :month', { month: parseInt(query.month) });
    }

    if (query.type) {
      qb.andWhere('goal.type = :type', { type: query.type });
    }

    if (query.sellerId) {
      qb.andWhere('goal.sellerId = :sellerId', { sellerId: query.sellerId });
    }

    if (query.isActive !== undefined) {
      qb.andWhere('goal.isActive = :isActive', { isActive: query.isActive });
    }

    qb.orderBy('goal.year', 'DESC')
      .addOrderBy('goal.month', 'DESC')
      .addOrderBy('goal.createdAt', 'DESC');

    return qb.getMany();
  }

  async findOne(id: string) {
    const goal = await this.salesGoalsRepository.findOne({
      where: { id },
      relations: { shop: true, seller: true },
    });

    if (!goal) {
      throw new NotFoundException('Meta não encontrada');
    }

    return goal;
  }

  async update(id: string, dto: UpdateSalesGoalDto) {
    const goal = await this.findOne(id);

    Object.assign(goal, dto);
    return this.salesGoalsRepository.save(goal);
  }

  async remove(id: string) {
    const goal = await this.findOne(id);
    await this.salesGoalsRepository.remove(goal);
    return { success: true };
  }

  async updateCurrentValues() {
    // Update current values for all active goals based on actual sales
    const activeGoals = await this.salesGoalsRepository.find({
      where: { isActive: true },
      relations: { shop: true, seller: true },
    });

    for (const goal of activeGoals) {
      let currentValue = 0;

      if (goal.type === SalesGoalType.ShopMonthly) {
        // Calculate total sales for the shop in the month
        const sales = await this.saleClosuresRepository
          .createQueryBuilder('sale')
          .select('SUM(sale.salePrice)', 'total')
          .where('sale.shopId = :shopId', { shopId: goal.shopId })
          .andWhere('sale.outcomeType = :outcomeType', { outcomeType: SaleOutcomeType.Sale })
          .andWhere('EXTRACT(YEAR FROM sale.closedAt) = :year', { year: goal.year })
          .andWhere('EXTRACT(MONTH FROM sale.closedAt) = :month', { month: goal.month })
          .getRawOne();

        currentValue = parseFloat(sales?.total || '0');
      } else if (goal.type === SalesGoalType.SellerMonthly) {
        // Calculate total sales for the seller in the month
        const sales = await this.saleClosuresRepository
          .createQueryBuilder('sale')
          .select('SUM(sale.salePrice)', 'total')
          .where('sale.sellerId = :sellerId', { sellerId: goal.sellerId })
          .andWhere('sale.outcomeType = :outcomeType', { outcomeType: SaleOutcomeType.Sale })
          .andWhere('EXTRACT(YEAR FROM sale.closedAt) = :year', { year: goal.year })
          .andWhere('EXTRACT(MONTH FROM sale.closedAt) = :month', { month: goal.month })
          .getRawOne();

        currentValue = parseFloat(sales?.total || '0');
      }

      goal.currentValue = currentValue;
      await this.salesGoalsRepository.save(goal);
    }
  }

  async getGoalsWithProgress(shopId: string, year?: number, month?: number) {
    const currentYear = year || new Date().getFullYear();
    const currentMonth = month || new Date().getMonth() + 1;

    const goals = await this.salesGoalsRepository.find({
      where: {
        shopId,
        year: currentYear,
        month: currentMonth,
        isActive: true,
      },
      relations: { seller: true },
    });

    return goals.map(goal => ({
      ...goal,
      progress: goal.targetValue > 0 ? (goal.currentValue / goal.targetValue) * 100 : 0,
      remaining: Math.max(0, goal.targetValue - goal.currentValue),
    }));
  }

  async getSellerGoals(sellerId: string, year?: number, month?: number) {
    const currentYear = year || new Date().getFullYear();
    const currentMonth = month || new Date().getMonth() + 1;

    const goals = await this.salesGoalsRepository.find({
      where: {
        sellerId,
        year: currentYear,
        month: currentMonth,
        isActive: true,
      },
      relations: { shop: true },
    });

    return goals.map(goal => ({
      ...goal,
      progress: goal.targetValue > 0 ? (goal.currentValue / goal.targetValue) * 100 : 0,
      remaining: Math.max(0, goal.targetValue - goal.currentValue),
    }));
  }
}