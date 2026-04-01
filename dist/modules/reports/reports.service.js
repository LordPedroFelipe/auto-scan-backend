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
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const lead_entity_1 = require("../leads/entities/lead.entity");
const shop_entity_1 = require("../shops/entities/shop.entity");
const test_drive_entity_1 = require("../test-drives/entities/test-drive.entity");
const vehicle_entity_1 = require("../vehicles/entities/vehicle.entity");
let ReportsService = class ReportsService {
    constructor(shopsRepository, vehiclesRepository, leadsRepository, testDrivesRepository) {
        this.shopsRepository = shopsRepository;
        this.vehiclesRepository = vehiclesRepository;
        this.leadsRepository = leadsRepository;
        this.testDrivesRepository = testDrivesRepository;
    }
    async shopReport(shopId, query) {
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
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(shop_entity_1.ShopEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(vehicle_entity_1.VehicleEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(lead_entity_1.LeadEntity)),
    __param(3, (0, typeorm_1.InjectRepository)(test_drive_entity_1.TestDriveEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ReportsService);
