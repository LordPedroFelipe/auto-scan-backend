"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const bcrypt = __importStar(require("bcrypt"));
const lead_entity_1 = require("../modules/leads/entities/lead.entity");
const shop_entity_1 = require("../modules/shops/entities/shop.entity");
const user_entity_1 = require("../modules/users/entities/user.entity");
const vehicle_entity_1 = require("../modules/vehicles/entities/vehicle.entity");
const data_source_1 = require("../database/data-source");
async function seed() {
    await data_source_1.AppDataSource.initialize();
    await data_source_1.AppDataSource.synchronize();
    const usersRepository = data_source_1.AppDataSource.getRepository(user_entity_1.UserEntity);
    const shopsRepository = data_source_1.AppDataSource.getRepository(shop_entity_1.ShopEntity);
    const vehiclesRepository = data_source_1.AppDataSource.getRepository(vehicle_entity_1.VehicleEntity);
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
    console.log(`Status inicial de lead disponível: ${lead_entity_1.LeadStatus.New}`);
    await data_source_1.AppDataSource.destroy();
}
seed().catch(async (error) => {
    console.error('Erro ao executar seed:', error);
    if (data_source_1.AppDataSource.isInitialized) {
        await data_source_1.AppDataSource.destroy();
    }
    process.exit(1);
});
