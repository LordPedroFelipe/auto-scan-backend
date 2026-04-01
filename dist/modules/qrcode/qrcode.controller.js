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
exports.QrCodeController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const create_qr_code_dto_1 = require("./dto/create-qr-code.dto");
const qr_code_query_dto_1 = require("./dto/qr-code-query.dto");
const qrcode_service_1 = require("./qrcode.service");
let QrCodeController = class QrCodeController {
    constructor(qrCodeService) {
        this.qrCodeService = qrCodeService;
    }
    findAll(query) {
        return this.qrCodeService.findAll(query);
    }
    findByShop(shopId, query) {
        return this.qrCodeService.findAll({ ...query, shopId });
    }
    findByVehicle(vehicleId, shopId, vehiclePlate) {
        return this.qrCodeService.getVehicleQrDetails(shopId, vehicleId, vehiclePlate);
    }
    async imageByVehicle(vehicleId, shopId, vehiclePlate) {
        return this.qrCodeService.renderVehicleSvg(shopId, vehicleId, vehiclePlate);
    }
    create(shopId, dto) {
        return this.qrCodeService.create(shopId, dto);
    }
    async image(id) {
        return this.qrCodeService.renderSvg(id);
    }
};
exports.QrCodeController = QrCodeController;
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Listar QR Codes' }),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [qr_code_query_dto_1.QrCodeQueryDto]),
    __metadata("design:returntype", void 0)
], QrCodeController.prototype, "findAll", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Listar QR Codes por loja' }),
    (0, common_1.Get)('shop/:shopId'),
    __param(0, (0, common_1.Param)('shopId', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, qr_code_query_dto_1.QrCodeQueryDto]),
    __metadata("design:returntype", void 0)
], QrCodeController.prototype, "findByShop", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Obter ou criar QR Code de um veiculo e renderizar SVG' }),
    (0, common_1.Get)('vehicle/:vehicleId'),
    __param(0, (0, common_1.Param)('vehicleId', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Query)('shopId', new common_1.ParseUUIDPipe())),
    __param(2, (0, common_1.Query)('vehiclePlate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], QrCodeController.prototype, "findByVehicle", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Obter ou criar QR Code de um veiculo e renderizar SVG' }),
    (0, common_1.Get)('vehicle/:vehicleId/image'),
    (0, common_1.Header)('Content-Type', 'image/svg+xml'),
    __param(0, (0, common_1.Param)('vehicleId', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Query)('shopId', new common_1.ParseUUIDPipe())),
    __param(2, (0, common_1.Query)('vehiclePlate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], QrCodeController.prototype, "imageByVehicle", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Criar QR Code para uma loja' }),
    (0, common_1.Post)('shop/:shopId'),
    __param(0, (0, common_1.Param)('shopId', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_qr_code_dto_1.CreateQrCodeDto]),
    __metadata("design:returntype", void 0)
], QrCodeController.prototype, "create", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Renderizar imagem SVG do QR Code' }),
    (0, common_1.Get)(':id/image'),
    (0, common_1.Header)('Content-Type', 'image/svg+xml'),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], QrCodeController.prototype, "image", null);
exports.QrCodeController = QrCodeController = __decorate([
    (0, swagger_1.ApiTags)('QRCode'),
    (0, common_1.Controller)('QRCode'),
    __metadata("design:paramtypes", [qrcode_service_1.QrCodeService])
], QrCodeController);
