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
exports.TestDrivesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const create_test_drive_dto_1 = require("./dto/create-test-drive.dto");
const test_drives_query_dto_1 = require("./dto/test-drives-query.dto");
const update_test_drive_dto_1 = require("./dto/update-test-drive.dto");
const test_drives_service_1 = require("./test-drives.service");
let TestDrivesController = class TestDrivesController {
    constructor(testDrivesService) {
        this.testDrivesService = testDrivesService;
    }
    findAll(query) {
        return this.testDrivesService.findAll(query);
    }
    findOne(id) {
        return this.testDrivesService.findOne(id);
    }
    create(dto) {
        return this.testDrivesService.create(dto);
    }
    update(id, dto) {
        return this.testDrivesService.update(id, dto);
    }
    remove(id) {
        return this.testDrivesService.remove(id);
    }
};
exports.TestDrivesController = TestDrivesController;
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Listar agendamentos de test drive' }),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [test_drives_query_dto_1.TestDrivesQueryDto]),
    __metadata("design:returntype", void 0)
], TestDrivesController.prototype, "findAll", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Obter um test drive por ID' }),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TestDrivesController.prototype, "findOne", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Criar agendamento de test drive' }),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_test_drive_dto_1.CreateTestDriveDto]),
    __metadata("design:returntype", void 0)
], TestDrivesController.prototype, "create", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Atualizar agendamento de test drive' }),
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_test_drive_dto_1.UpdateTestDriveDto]),
    __metadata("design:returntype", void 0)
], TestDrivesController.prototype, "update", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Remover agendamento de test drive' }),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TestDrivesController.prototype, "remove", null);
exports.TestDrivesController = TestDrivesController = __decorate([
    (0, swagger_1.ApiTags)('TestDrives'),
    (0, common_1.Controller)('TestDrives'),
    __metadata("design:paramtypes", [test_drives_service_1.TestDrivesService])
], TestDrivesController);
