import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { createHash } from 'crypto';
import { Repository } from 'typeorm';
import { ShopEntity } from '../shops/entities/shop.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersQueryDto } from './dto/users-query.dto';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    @InjectRepository(ShopEntity)
    private readonly shopsRepository: Repository<ShopEntity>,
  ) {}

  async findAll(query: UsersQueryDto = {}) {
    const pageNumber = query.PageNumber ?? query.pageNumber ?? 1;
    const pageSize = query.PageSize ?? query.pageSize ?? 10;
    const search = query.q ?? query.search;
    const shopId = query.ShopId ?? query.shopId;

    const qb = this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.shop', 'shop');

    if (shopId) {
      qb.andWhere('user.shopId = :shopId', { shopId });
    }

    if (search) {
      qb.andWhere(
        '(user.userName ILIKE :search OR user.email ILIKE :search OR user.phoneNumber ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    qb.orderBy('user.createdAt', 'DESC');
    qb.skip((pageNumber - 1) * pageSize);
    qb.take(pageSize);

    const [items, totalCount] = await qb.getManyAndCount();

    return {
      items,
      pageNumber,
      pageSize,
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize) || 1,
    };
  }

  async listItems() {
    const users = await this.usersRepository.find({
      select: {
        id: true,
        userName: true,
        email: true,
      },
      order: {
        userName: 'ASC',
      },
    });

    return users.map((user) => ({
      id: user.id,
      label: `${user.userName} (${user.email})`,
      description: `${user.userName} (${user.email})`,
      userName: user.userName,
      email: user.email,
    }));
  }

  async findOne(id: string) {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: {
        shop: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    return user;
  }

  async findByEmail(email: string) {
    return this.usersRepository.findOne({
      where: { email: email.toLowerCase() },
      relations: {
        shop: true,
      },
    });
  }

  async findByEmailWithPassword(email: string) {
    return this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.shop', 'shop')
      .addSelect('user.passwordHash')
      .where('LOWER(user.email) = LOWER(:email)', { email })
      .getOne();
  }

  async create(dto: CreateUserDto) {
    const existingUser = await this.findByEmail(dto.email);
    if (existingUser) {
      throw new BadRequestException('Já existe um usuário com este email.');
    }

    if (dto.shopId) {
      await this.ensureShopExists(dto.shopId);
    }

    const passwordHash = dto.password
      ? await bcrypt.hash(dto.password, 10)
      : undefined;

    const user = this.usersRepository.create({
      userName: dto.userName,
      email: dto.email.toLowerCase(),
      phoneNumber: dto.phoneNumber ?? null,
      passwordHash,
      roles: dto.roles ?? ['Seller'],
      claims: [],
      emailConfirmed: false,
      lockoutEnabled: false,
      accessFailedCount: 0,
      isActive: dto.isActive ?? true,
      passwordResetTokenHash: null,
      passwordResetExpiresAt: null,
      welcomeEmailSentAt: null,
      shopId: dto.shopId ?? null,
    });

    const savedUser = await this.usersRepository.save(user);
    return this.findOne(savedUser.id);
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.findOne(id);

    if (dto.email && dto.email.toLowerCase() !== user.email.toLowerCase()) {
      const existingUser = await this.findByEmail(dto.email);
      if (existingUser && existingUser.id !== id) {
        throw new BadRequestException('Já existe um usuário com este email.');
      }
    }

    if (dto.shopId) {
      await this.ensureShopExists(dto.shopId);
    }

    if (dto.password) {
      user.passwordHash = await bcrypt.hash(dto.password, 10);
    }

    user.userName = dto.userName ?? user.userName;
    user.email = dto.email?.toLowerCase() ?? user.email;
    user.phoneNumber = dto.phoneNumber ?? user.phoneNumber;
    user.roles = dto.roles ?? user.roles;
    user.claims = dto.claims ?? user.claims;
    user.shopId = dto.shopId ?? user.shopId;
    user.isActive = dto.isActive ?? user.isActive;

    await this.usersRepository.save(user);
    return this.findOne(id);
  }

  async remove(id: string) {
    const user = await this.findOne(id);
    await this.usersRepository.remove(user);
    return { success: true };
  }

  async savePasswordResetToken(userId: string, token: string, expiresAt: Date) {
    const user = await this.findOne(userId);
    user.passwordResetTokenHash = this.hashToken(token);
    user.passwordResetExpiresAt = expiresAt;
    await this.usersRepository.save(user);
  }

  async findByPasswordResetToken(token: string) {
    return this.usersRepository.findOne({
      where: {
        passwordResetTokenHash: this.hashToken(token),
      },
      relations: {
        shop: true,
      },
    });
  }

  async updatePassword(userId: string, password: string) {
    const user = await this.findOne(userId);
    user.passwordHash = await bcrypt.hash(password, 10);
    user.passwordResetTokenHash = null;
    user.passwordResetExpiresAt = null;
    await this.usersRepository.save(user);
    return this.findOne(userId);
  }

  async clearPasswordResetToken(userId: string) {
    const user = await this.findOne(userId);
    user.passwordResetTokenHash = null;
    user.passwordResetExpiresAt = null;
    await this.usersRepository.save(user);
  }

  async markWelcomeEmailSent(userId: string) {
    const user = await this.findOne(userId);
    user.welcomeEmailSentAt = new Date();
    await this.usersRepository.save(user);
  }

  toSafeUser(user: UserEntity) {
    const { passwordHash: _passwordHash, ...safeUser } = user;
    return safeUser;
  }

  private hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  private async ensureShopExists(shopId: string) {
    const shop = await this.shopsRepository.findOne({ where: { id: shopId } });
    if (!shop) {
      throw new BadRequestException('Loja não encontrada.');
    }
  }
}
