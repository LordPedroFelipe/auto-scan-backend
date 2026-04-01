import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { LeadStatus } from '../modules/leads/entities/lead.entity';
import { ShopEntity } from '../modules/shops/entities/shop.entity';
import { UserEntity } from '../modules/users/entities/user.entity';
import { VehicleEntity } from '../modules/vehicles/entities/vehicle.entity';
import { AppDataSource } from '../database/data-source';

async function seed(): Promise<void> {
  await AppDataSource.initialize();
  await AppDataSource.synchronize();

  const usersRepository = AppDataSource.getRepository(UserEntity);
  const shopsRepository = AppDataSource.getRepository(ShopEntity);
  const vehiclesRepository = AppDataSource.getRepository(VehicleEntity);

  const adminEmail = 'admin@autoscan.local';
  const adminPassword = 'Admin@123';

  let admin = await usersRepository.findOne({ where: { email: adminEmail } });
  if (!admin) {
    admin = usersRepository.create({
      userName: 'Admin Auto Scan',
      email: adminEmail,
      phoneNumber: '(47) 99999-0000',
      passwordHash: await bcrypt.hash(adminPassword, 10),
      roles: ['Admin'],
      emailConfirmed: true,
      lockoutEnabled: false,
      accessFailedCount: 0,
      isActive: true,
      shopId: null,
    });
    admin = await usersRepository.save(admin);
  }

  let shop = await shopsRepository.findOne({
    where: { email: 'contato@lojademo.local' },
  });

  if (!shop) {
    shop = shopsRepository.create({
      name: 'Loja Demo Auto Scan',
      description: 'Loja inicial para reconectar o frontend.',
      cnpj: '12.345.678/0001-90',
      email: 'contato@lojademo.local',
      phoneNumber: '(47) 3333-0000',
      addressLine: 'Rua das Oficinas, 100',
      city: 'Blumenau',
      state: 'SC',
      zipCode: '89000-000',
      ownerId: admin.id,
      isActive: true,
      isDeleted: false,
    });
    shop = await shopsRepository.save(shop);
  }

  if (admin.shopId !== shop.id) {
    admin.shopId = shop.id;
    await usersRepository.save(admin);
  }

  const existingVehiclesCount = await vehiclesRepository.count({
    where: { shopId: shop.id },
  });

  if (existingVehiclesCount === 0) {
    const vehicles = vehiclesRepository.create([
      {
        shopId: shop.id,
        brand: 'Chevrolet',
        model: 'Onix',
        version: '1.0 Turbo LT',
        year: 2023,
        plate: 'ABC1D23',
        color: 'Branco',
        transmission: 'Automático',
        fuelType: 'Flex',
        condition: 'Seminovo',
        categoryType: 'Hatch',
        mileage: 18000,
        price: 89990,
        city: 'Blumenau',
        state: 'SC',
        description: 'Veículo de entrada para testes do catálogo.',
        ownersCount: 1,
        photoUrls: [],
        hasAuction: false,
        hasAccident: false,
        isFirstOwner: true,
        isOnOffer: true,
        isHighlighted: true,
        isSold: false,
      },
      {
        shopId: shop.id,
        brand: 'Toyota',
        model: 'Corolla',
        version: 'XEi 2.0',
        year: 2022,
        plate: 'EFG4H56',
        color: 'Prata',
        transmission: 'Automático',
        fuelType: 'Flex',
        condition: 'Seminovo',
        categoryType: 'Sedan',
        mileage: 27500,
        price: 139900,
        city: 'Blumenau',
        state: 'SC',
        description: 'Sedan de referência para fluxo de detalhe e financiamento.',
        ownersCount: 1,
        photoUrls: [],
        hasAuction: false,
        hasAccident: false,
        isFirstOwner: false,
        isConsigned: false,
        isOnOffer: false,
        isHighlighted: true,
        isSold: false,
      },
      {
        shopId: shop.id,
        brand: 'Volkswagen',
        model: 'T-Cross',
        version: 'Comfortline 200 TSI',
        year: 2024,
        plate: 'IJK7L89',
        color: 'Cinza',
        transmission: 'Automático',
        fuelType: 'Flex',
        condition: 'Seminovo',
        categoryType: 'SUV',
        mileage: 9500,
        price: 154900,
        city: 'Blumenau',
        state: 'SC',
        description: 'SUV para validar chat, lead e test drive.',
        ownersCount: 1,
        photoUrls: [],
        hasAuction: false,
        hasAccident: false,
        isFirstOwner: true,
        isConsigned: false,
        isOnOffer: true,
        isHighlighted: true,
        isSold: false,
      },
    ]);

    await vehiclesRepository.save(vehicles);
  }

  console.log('Seed concluído.');
  console.log(`Admin: ${adminEmail}`);
  console.log(`Senha: ${adminPassword}`);
  console.log(`ShopId: ${shop.id}`);
  console.log(`Status inicial de lead disponível: ${LeadStatus.New}`);

  await AppDataSource.destroy();
}

seed().catch(async (error) => {
  console.error('Erro ao executar seed:', error);
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }
  process.exit(1);
});
