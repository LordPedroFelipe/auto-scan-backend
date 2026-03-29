import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../users/entities/user.entity';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { ShopEntity } from './entities/shop.entity';

@Injectable()
export class ShopsService {
  constructor(
    @InjectRepository(ShopEntity)
    private readonly shopsRepository: Repository<ShopEntity>,
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
  ) {}

  async findAll() {
    return this.shopsRepository.find({
      relations: {
        owner: true,
        users: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: string) {
    const shop = await this.shopsRepository.findOne({
      where: { id },
      relations: {
        owner: true,
        users: true,
      },
    });

    if (!shop) {
      throw new NotFoundException('Loja não encontrada.');
    }

    return shop;
  }

  async create(dto: CreateShopDto) {
    if (dto.ownerId) {
      await this.ensureOwnerExists(dto.ownerId);
    }

    const shop = this.shopsRepository.create({
      name: dto.name,
      description: dto.description ?? null,
      cnpj: dto.cnpj ?? null,
      email: dto.email?.toLowerCase() ?? null,
      phoneNumber: dto.phoneNumber ?? null,
      addressLine: dto.addressLine ?? null,
      city: dto.city ?? null,
      state: dto.state ?? null,
      zipCode: dto.zipCode ?? null,
      qrCodeLimit: dto.qrCodeLimit ?? 10,
      inventoryFeedUrl: dto.inventoryFeedUrl ?? null,
      inventorySourceCode: dto.inventorySourceCode ?? null,
      inventorySyncCron: dto.inventorySyncCron ?? null,
      inventorySyncEnabled: dto.inventorySyncEnabled ?? false,
      inventoryLastSyncAt: null,
      inventoryLastSyncStatus: null,
      inventoryLastSyncError: null,
      ownerId: dto.ownerId ?? null,
      isActive: dto.isActive ?? true,
      isDeleted: false,
    });

    const savedShop = await this.shopsRepository.save(shop);
    return this.findOne(savedShop.id);
  }

  async update(id: string, dto: UpdateShopDto) {
    const shop = await this.findOne(id);

    if (dto.ownerId) {
      await this.ensureOwnerExists(dto.ownerId);
    }

    shop.name = dto.name ?? shop.name;
    shop.description = dto.description ?? shop.description;
    shop.cnpj = dto.cnpj ?? shop.cnpj;
    shop.email = dto.email?.toLowerCase() ?? shop.email;
    shop.phoneNumber = dto.phoneNumber ?? shop.phoneNumber;
    shop.addressLine = dto.addressLine ?? shop.addressLine;
    shop.city = dto.city ?? shop.city;
    shop.state = dto.state ?? shop.state;
    shop.zipCode = dto.zipCode ?? shop.zipCode;
    shop.qrCodeLimit = dto.qrCodeLimit ?? shop.qrCodeLimit;
    shop.inventoryFeedUrl = dto.inventoryFeedUrl ?? shop.inventoryFeedUrl;
    shop.inventorySourceCode = dto.inventorySourceCode ?? shop.inventorySourceCode;
    shop.inventorySyncCron = dto.inventorySyncCron ?? shop.inventorySyncCron;
    shop.inventorySyncEnabled = dto.inventorySyncEnabled ?? shop.inventorySyncEnabled;
    shop.ownerId = dto.ownerId ?? shop.ownerId;
    shop.isActive = dto.isActive ?? shop.isActive;

    await this.shopsRepository.save(shop);
    return this.findOne(id);
  }

  async remove(id: string) {
    const shop = await this.findOne(id);
    shop.isDeleted = true;
    shop.isActive = false;
    await this.shopsRepository.save(shop);
    return { success: true };
  }

  async listSellers(shopId: string) {
    await this.findOne(shopId);
    return this.usersRepository.find({
      where: { shopId },
      order: { userName: 'ASC' },
    });
  }

  async addSeller(shopId: string, sellerId: string) {
    await this.findOne(shopId);
    const seller = await this.usersRepository.findOne({ where: { id: sellerId } });
    if (!seller) {
      throw new NotFoundException('Vendedor não encontrado.');
    }

    seller.shopId = shopId;
    if (!seller.roles?.length) {
      seller.roles = ['ShopSeller'];
    }
    await this.usersRepository.save(seller);
    return { success: true };
  }

  async removeSeller(shopId: string, sellerId: string) {
    await this.findOne(shopId);
    const seller = await this.usersRepository.findOne({
      where: { id: sellerId, shopId },
    });
    if (!seller) {
      throw new NotFoundException('Vendedor não encontrado nesta loja.');
    }

    seller.shopId = null;
    await this.usersRepository.save(seller);
    return { success: true };
  }

  private async ensureOwnerExists(ownerId: string) {
    const owner = await this.usersRepository.findOne({ where: { id: ownerId } });
    if (!owner) {
      throw new BadRequestException('Usuário proprietário não encontrado.');
    }
  }
}
