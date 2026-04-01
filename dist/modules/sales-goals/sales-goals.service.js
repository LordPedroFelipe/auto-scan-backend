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
exports.SalesGoalsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const sale_closure_entity_1 = require("../sales/entities/sale-closure.entity");
const shop_entity_1 = require("../shops/entities/shop.entity");
const user_entity_1 = require("../users/entities/user.entity");
const sales_goal_entity_1 = require("./entities/sales-goal.entity");
let SalesGoalsService = class SalesGoalsService {
    constructor(salesGoalsRepository, shopsRepository, usersRepository, saleClosuresRepository) {
        this.salesGoalsRepository = salesGoalsRepository;
        this.shopsRepository = shopsRepository;
        this.usersRepository = usersRepository;
        this.saleClosuresRepository = saleClosuresRepository;
    }
    async create(dto, shopId) {
        // Validate shop exists
        const shop = await this.shopsRepository.findOne({ where: { id: shopId } });
        if (!shop) {
            throw new common_1.NotFoundException('Loja não encontrada');
        }
        // Validate seller if provided
        if (dto.sellerId) {
            const seller = await this.usersRepository.findOne({ where: { id: dto.sellerId } });
            if (!seller) {
                throw new common_1.NotFoundException('Vendedor não encontrado');
            }
        }
        const goal = this.salesGoalsRepository.create({
            ...dto,
            shopId,
            isActive: true,
            currentValue: 0,
            startDate: dto.type === sales_goal_entity_1.SalesGoalType.Campaign ? new Date(dto.year, dto.month - 1, 1) : null,
            endDate: dto.type === sales_goal_entity_1.SalesGoalType.Campaign ? new Date(dto.year, dto.month, 0) : null,
        });
        return this.salesGoalsRepository.save(goal);
    }
    async findAll(query, shopId) {
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
    async findOne(id) {
        const goal = await this.salesGoalsRepository.findOne({
            where: { id },
            relations: { shop: true, seller: true },
        });
        if (!goal) {
            throw new common_1.NotFoundException('Meta não encontrada');
        }
        return goal;
    }
    async update(id, dto) {
        const goal = await this.findOne(id);
        Object.assign(goal, dto);
        return this.salesGoalsRepository.save(goal);
    }
    async remove(id) {
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
            if (goal.type === sales_goal_entity_1.SalesGoalType.ShopMonthly) {
                // Calculate total sales for the shop in the month
                const sales = await this.saleClosuresRepository
                    .createQueryBuilder('sale')
                    .select('SUM(sale.salePrice)', 'total')
                    .where('sale.shopId = :shopId', { shopId: goal.shopId })
                    .andWhere('sale.outcomeType = :outcomeType', { outcomeType: sale_closure_entity_1.SaleOutcomeType.Sale })
                    .andWhere('EXTRACT(YEAR FROM sale.closedAt) = :year', { year: goal.year })
                    .andWhere('EXTRACT(MONTH FROM sale.closedAt) = :month', { month: goal.month })
                    .getRawOne();
                currentValue = parseFloat(sales?.total || '0');
            }
            else if (goal.type === sales_goal_entity_1.SalesGoalType.SellerMonthly) {
                // Calculate total sales for the seller in the month
                const sales = await this.saleClosuresRepository
                    .createQueryBuilder('sale')
                    .select('SUM(sale.salePrice)', 'total')
                    .where('sale.sellerId = :sellerId', { sellerId: goal.sellerId })
                    .andWhere('sale.outcomeType = :outcomeType', { outcomeType: sale_closure_entity_1.SaleOutcomeType.Sale })
                    .andWhere('EXTRACT(YEAR FROM sale.closedAt) = :year', { year: goal.year })
                    .andWhere('EXTRACT(MONTH FROM sale.closedAt) = :month', { month: goal.month })
                    .getRawOne();
                currentValue = parseFloat(sales?.total || '0');
            }
            goal.currentValue = currentValue;
            await this.salesGoalsRepository.save(goal);
        }
    }
    async getGoalsWithProgress(shopId, year, month) {
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
    async getSellerGoals(sellerId, year, month) {
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
};
exports.SalesGoalsService = SalesGoalsService;
exports.SalesGoalsService = SalesGoalsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(sales_goal_entity_1.SalesGoalEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(shop_entity_1.ShopEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.UserEntity)),
    __param(3, (0, typeorm_1.InjectRepository)(sale_closure_entity_1.SaleClosureEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], SalesGoalsService);
