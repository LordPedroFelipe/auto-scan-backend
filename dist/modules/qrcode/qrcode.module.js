"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QrCodeModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const qrcode_controller_1 = require("./qrcode.controller");
const qrcode_service_1 = require("./qrcode.service");
const qr_code_entity_1 = require("./entities/qr-code.entity");
let QrCodeModule = class QrCodeModule {
};
exports.QrCodeModule = QrCodeModule;
exports.QrCodeModule = QrCodeModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([qr_code_entity_1.QrCodeEntity])],
        controllers: [qrcode_controller_1.QrCodeController],
        providers: [qrcode_service_1.QrCodeService],
        exports: [qrcode_service_1.QrCodeService],
    })
], QrCodeModule);
