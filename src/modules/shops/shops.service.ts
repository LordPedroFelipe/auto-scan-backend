import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { DataSource, Repository } from 'typeorm';
import { EmailService } from '../email/email.service';
import { buildWelcomeEmailTemplate } from '../email/email.templates';
import { UserEntity } from '../users/entities/user.entity';
import { CreateShopDto } from './dto/create-shop.dto';
import { CreateShopOnboardingDto } from './dto/create-shop-onboarding.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { ShopEntity } from './entities/shop.entity';

@Injectable()
export class ShopsService {
  private readonly logger = new Logger(ShopsService.name);

  constructor(
    @InjectRepository(ShopEntity)
    private readonly shopsRepository: Repository<ShopEntity>,
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    private readonly dataSource: DataSource,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
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
      throw new NotFoundException('Loja nao encontrada.');
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

  async createOnboarding(dto: CreateShopOnboardingDto) {
    const normalizedShopEmail = dto.email.toLowerCase();
    const normalizedMasterEmail = dto.masterUser.email.toLowerCase();

    if (normalizedShopEmail !== normalizedMasterEmail) {
      throw new BadRequestException(
        'O email da loja e do usuario master devem ser o mesmo neste fluxo inicial.',
      );
    }

    const existingUser = await this.usersRepository.findOne({
      where: { email: normalizedMasterEmail },
    });
    if (existingUser) {
      throw new BadRequestException('Ja existe um usuario com este email.');
    }

    if (dto.cnpj) {
      const existingShop = await this.shopsRepository.findOne({
        where: { cnpj: dto.cnpj },
      });
      if (existingShop) {
        throw new BadRequestException('Ja existe uma loja com este CNPJ.');
      }
    }

    const passwordHash = await bcrypt.hash(dto.masterUser.password, 10);

    const result = await this.dataSource.transaction(async (manager) => {
      const shopRepository = manager.getRepository(ShopEntity);
      const userRepository = manager.getRepository(UserEntity);

      const shop = shopRepository.create({
        name: dto.name,
        description: dto.description ?? null,
        cnpj: dto.cnpj ?? null,
        email: normalizedShopEmail,
        phoneNumber: dto.phoneNumber ?? dto.masterUser.phoneNumber ?? null,
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
        ownerId: null,
        isActive: true,
        isDeleted: false,
      });

      const savedShop = await shopRepository.save(shop);

      const masterUser = userRepository.create({
        userName: dto.masterUser.userName,
        email: normalizedMasterEmail,
        phoneNumber: dto.masterUser.phoneNumber ?? dto.phoneNumber ?? null,
        passwordHash,
        roles: ['ShopManager'],
        claims: [],
        emailConfirmed: false,
        lockoutEnabled: false,
        accessFailedCount: 0,
        isActive: true,
        passwordResetTokenHash: null,
        passwordResetExpiresAt: null,
        welcomeEmailSentAt: null,
        shopId: savedShop.id,
      });

      const savedMasterUser = await userRepository.save(masterUser);

      savedShop.ownerId = savedMasterUser.id;
      await shopRepository.save(savedShop);

      return {
        shopId: savedShop.id,
        masterUserId: savedMasterUser.id,
      };
    });

    const shop = await this.findOne(result.shopId);
    const masterUser = await this.usersRepository.findOne({
      where: { id: result.masterUserId },
      relations: { shop: true },
    });

    if (masterUser) {
      await this.sendWelcomeEmail(masterUser).catch((error: unknown) => {
        this.logger.warn(`Falha ao enviar boas-vindas no onboarding: ${String(error)}`);
      });
    }

    return {
      shop,
      masterUser,
    };
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
      throw new NotFoundException('Vendedor nao encontrado.');
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
      throw new NotFoundException('Vendedor nao encontrado nesta loja.');
    }

    seller.shopId = null;
    await this.usersRepository.save(seller);
    return { success: true };
  }

  private async ensureOwnerExists(ownerId: string) {
    const owner = await this.usersRepository.findOne({ where: { id: ownerId } });
    if (!owner) {
      throw new BadRequestException('Usuario proprietario nao encontrado.');
    }
  }

  private async sendWelcomeEmail(user: UserEntity) {
    const frontendBaseUrl = this.configService.get<string>(
      'FRONTEND_BASE_URL',
      'http://localhost:4200',
    );
    const loginUrl = `${frontendBaseUrl}/#/login?email=${encodeURIComponent(user.email)}`;

    const result = await this.emailService.send({
      to: {
        email: user.email,
        name: user.userName,
      },
      subject: 'ScanDrive | Sua conta da loja esta pronta',
      html: buildWelcomeEmailTemplate({
        customerName: user.userName,
        loginUrl,
        shopName: user.shop?.name ?? null,
      }),
      text: `Oi, ${user.userName}. Sua conta da loja ja esta pronta. Entre em ${loginUrl}.`,
    });

    if (result.delivered) {
      user.welcomeEmailSentAt = new Date();
      await this.usersRepository.save(user);
    }
  }
}
