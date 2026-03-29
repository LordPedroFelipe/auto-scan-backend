import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShopEntity } from '../shops/entities/shop.entity';
import { UserEntity } from '../users/entities/user.entity';
import { CreateSubscriptionPaymentDto } from './dto/create-subscription-payment.dto';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { SubscriptionPaymentsQueryDto } from './dto/subscription-payments-query.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { SubscriptionPaymentEntity } from './entities/subscription-payment.entity';
import { SubscriptionEntity } from './entities/subscription.entity';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(SubscriptionEntity)
    private readonly subscriptionsRepository: Repository<SubscriptionEntity>,
    @InjectRepository(SubscriptionPaymentEntity)
    private readonly paymentsRepository: Repository<SubscriptionPaymentEntity>,
    @InjectRepository(ShopEntity)
    private readonly shopsRepository: Repository<ShopEntity>,
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
  ) {}

  async listSubscriptions(query: SubscriptionPaymentsQueryDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 10;

    const qb = this.subscriptionsRepository.createQueryBuilder('subscription');

    if (query.status) {
      qb.andWhere('subscription.isActive = :isActive', {
        isActive: query.status.toLowerCase() === 'active',
      });
    }

    qb.orderBy('subscription.createdAt', 'DESC');
    qb.skip((page - 1) * pageSize);
    qb.take(pageSize);

    const [items, totalCount] = await qb.getManyAndCount();
    return this.paginate(
      items.map((item) => this.toSubscriptionResponse(item)),
      totalCount,
      page,
      pageSize,
    );
  }

  async getSubscription(id: string) {
    const subscription = await this.subscriptionsRepository.findOne({ where: { id } });
    if (!subscription) {
      throw new NotFoundException('Plano não encontrado.');
    }
    return this.toSubscriptionResponse(subscription);
  }

  async createSubscription(dto: CreateSubscriptionDto) {
    const subscription = this.subscriptionsRepository.create({
      ...dto,
      description: dto.description ?? null,
      isActive: dto.isActive ?? true,
    });
    const saved = await this.subscriptionsRepository.save(subscription);
    return this.toSubscriptionResponse(saved);
  }

  async updateSubscription(id: string, dto: UpdateSubscriptionDto) {
    const subscription = await this.getSubscription(id);
    Object.assign(subscription, dto);
    const saved = await this.subscriptionsRepository.save(subscription);
    return this.toSubscriptionResponse(saved);
  }

  async removeSubscription(id: string) {
    const subscription = await this.getSubscription(id);
    await this.subscriptionsRepository.remove(subscription);
    return { success: true };
  }

  async listPayments(query: SubscriptionPaymentsQueryDto, shopId?: string) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 10;

    const qb = this.paymentsRepository
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.subscription', 'subscription')
      .leftJoinAndSelect('payment.shop', 'shop')
      .leftJoinAndSelect('payment.user', 'user');

    if (shopId) {
      qb.andWhere('payment.shopId = :shopId', { shopId });
    }

    if (query.status) {
      qb.andWhere('LOWER(payment.status) = LOWER(:status)', { status: query.status });
    }

    qb.orderBy('payment.createdAt', 'DESC');
    qb.skip((page - 1) * pageSize);
    qb.take(pageSize);

    const [items, totalCount] = await qb.getManyAndCount();
    return this.paginate(items.map((item) => this.toPaymentResponse(item)), totalCount, page, pageSize);
  }

  async createPayment(shopId: string, subscriptionId: string, dto: CreateSubscriptionPaymentDto) {
    const subscription = await this.getSubscription(subscriptionId);
    const shop = await this.shopsRepository.findOne({ where: { id: shopId } });
    if (!shop) {
      throw new BadRequestException('Loja não encontrada.');
    }

    let user: UserEntity | null = null;
    if (dto.userId) {
      user = await this.usersRepository.findOne({ where: { id: dto.userId } });
      if (!user) {
        throw new BadRequestException('Usuário não encontrado.');
      }
    }

    const payment = this.paymentsRepository.create({
      subscriptionId: subscription.id,
      shopId: shop.id,
      userId: user?.id ?? null,
      amount: dto.amount,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      status: dto.status,
      invoiceUrl: dto.invoiceUrl ?? null,
    });

    const saved = await this.paymentsRepository.save(payment);
    const loaded = await this.paymentsRepository.findOne({
      where: { id: saved.id },
      relations: { subscription: true, shop: true, user: true },
    });

    if (!loaded) {
      throw new NotFoundException('Pagamento não encontrado após criação.');
    }

    return this.toPaymentResponse(loaded);
  }

  private paginate<T>(items: T[], totalCount: number, page: number, pageSize: number) {
    const totalPages = Math.ceil(totalCount / pageSize) || 1;
    return {
      items,
      pageNumber: page,
      pageSize,
      totalPages,
      totalCount,
      hasPreviousPage: page > 1,
      hasNextPage: page < totalPages,
    };
  }

  private toPaymentResponse(payment: SubscriptionPaymentEntity) {
    return {
      id: payment.id,
      subscriptionId: payment.subscriptionId,
      subscriptionName: payment.subscription?.name ?? '',
      shopId: payment.shopId,
      shopName: payment.shop?.name ?? null,
      userId: payment.userId,
      userName: payment.user?.userName ?? null,
      amount: Number(payment.amount),
      startDate: payment.startDate,
      endDate: payment.endDate,
      status: payment.status,
      invoiceUrl: payment.invoiceUrl,
      createdAt: payment.createdAt,
    };
  }

  private toSubscriptionResponse(subscription: SubscriptionEntity) {
    return {
      ...subscription,
      price: Number(subscription.price),
      durationInDays: Number(subscription.durationInDays),
      qrCodeLimit: Number(subscription.qrCodeLimit),
    };
  }
}
