"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestDrivesModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const lead_entity_1 = require("../leads/entities/lead.entity");
const shop_entity_1 = require("../shops/entities/shop.entity");
const vehicle_entity_1 = require("../vehicles/entities/vehicle.entity");
const test_drive_entity_1 = require("./entities/test-drive.entity");
const test_drives_controller_1 = require("./test-drives.controller");
const test_drives_service_1 = require("./test-drives.service");
let TestDrivesModule = class TestDrivesModule {
};
exports.TestDrivesModule = TestDrivesModule;
exports.TestDrivesModule = TestDrivesModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([test_drive_entity_1.TestDriveEntity, shop_entity_1.ShopEntity, vehicle_entity_1.VehicleEntity, lead_entity_1.LeadEntity])],
        controllers: [test_drives_controller_1.TestDrivesController],
        providers: [test_drives_service_1.TestDrivesService],
        exports: [test_drives_service_1.TestDrivesService],
    })
], TestDrivesModule);
