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
exports.VehiclesController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const path_1 = require("path");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const create_vehicle_dto_1 = require("./dto/create-vehicle.dto");
const update_vehicle_dto_1 = require("./dto/update-vehicle.dto");
const vehicles_query_dto_1 = require("./dto/vehicles-query.dto");
const vehicles_service_1 = require("./vehicles.service");
const { diskStorage } = require('multer');
const uploadDirectory = (0, path_1.join)(process.cwd(), 'uploads', 'vehicles');
const vehicleStorage = diskStorage({
    destination: uploadDirectory,
    filename: (_request, file, callback) => {
        const extension = (0, path_1.extname)(file.originalname || '').toLowerCase();
        const suffix = `${Date.now()}-${Math.round(Math.random() * 1_000_000_000)}`;
        const baseName = (file.originalname || 'vehicle')
            .replace(extension, '')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .slice(0, 60);
        callback(null, `${baseName || 'vehicle'}-${suffix}${extension || '.webp'}`);
    },
});
let VehiclesController = class VehiclesController {
    constructor(vehiclesService) {
        this.vehiclesService = vehiclesService;
    }
    findAll(query) {
        return this.vehiclesService.findAll(query);
    }
    listItems() {
        return this.vehiclesService.listItems();
    }
    findOne(id) {
        return this.vehiclesService.findOne(id);
    }
    create(dto, files, request) {
        return this.vehiclesService.create(dto, files ?? [], request);
    }
    update(id, dto, files, request) {
        return this.vehiclesService.update(id, dto, files ?? [], request);
    }
    remove(id) {
        return this.vehiclesService.remove(id);
    }
};
exports.VehiclesController = VehiclesController;
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Listar veiculos com filtros comerciais' }),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [vehicles_query_dto_1.VehiclesQueryDto]),
    __metadata("design:returntype", void 0)
], VehiclesController.prototype, "findAll", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Listar veiculos em formato simplificado para selects' }),
    (0, common_1.Get)('list-items'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], VehiclesController.prototype, "listItems", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Obter detalhes de um veiculo' }),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], VehiclesController.prototype, "findOne", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Criar veiculo' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('images', 20, {
        storage: vehicleStorage,
    })),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFiles)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_vehicle_dto_1.CreateVehicleDto, Array, Object]),
    __metadata("design:returntype", void 0)
], VehiclesController.prototype, "create", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Atualizar veiculo' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('images', 20, {
        storage: vehicleStorage,
    })),
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFiles)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_vehicle_dto_1.UpdateVehicleDto, Array, Object]),
    __metadata("design:returntype", void 0)
], VehiclesController.prototype, "update", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Remover veiculo' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], VehiclesController.prototype, "remove", null);
exports.VehiclesController = VehiclesController = __decorate([
    (0, swagger_1.ApiTags)('Vehicles'),
    (0, common_1.Controller)('Vehicles'),
    __metadata("design:paramtypes", [vehicles_service_1.VehiclesService])
], VehiclesController);
