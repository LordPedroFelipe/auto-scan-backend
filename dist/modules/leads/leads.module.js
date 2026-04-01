"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeadsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const lead_note_entity_1 = require("../lead-notes/entities/lead-note.entity");
const sale_closure_entity_1 = require("../sales/entities/sale-closure.entity");
const shop_entity_1 = require("../shops/entities/shop.entity");
const test_drive_entity_1 = require("../test-drives/entities/test-drive.entity");
const user_entity_1 = require("../users/entities/user.entity");
const vehicle_entity_1 = require("../vehicles/entities/vehicle.entity");
const lead_entity_1 = require("./entities/lead.entity");
const leads_controller_1 = require("./leads.controller");
const leads_service_1 = require("./leads.service");
let LeadsModule = class LeadsModule {
};
exports.LeadsModule = LeadsModule;
exports.LeadsModule = LeadsModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([lead_entity_1.LeadEntity, shop_entity_1.ShopEntity, vehicle_entity_1.VehicleEntity, user_entity_1.UserEntity, lead_note_entity_1.LeadNoteEntity, test_drive_entity_1.TestDriveEntity, sale_closure_entity_1.SaleClosureEntity])],
        controllers: [leads_controller_1.LeadsController],
        providers: [leads_service_1.LeadsService],
        exports: [leads_service_1.LeadsService],
    })
], LeadsModule);
