import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { ShopEntity } from '../shops/entities/shop.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    @InjectRepository(ShopEntity)
    private readonly shopsRepository: Repository<ShopEntity>,
  ) {}

  async findAll() {
    return this.usersRepository.find({
      relations: {
        shop: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });
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

  toSafeUser(user: UserEntity) {
    const { passwordHash: _passwordHash, ...safeUser } = user;
    return safeUser;
  }

  private async ensureShopExists(shopId: string) {
    const shop = await this.shopsRepository.findOne({ where: { id: shopId } });
    if (!shop) {
      throw new BadRequestException('Loja não encontrada.');
    }
  }
}
