"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateTestDriveDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_test_drive_dto_1 = require("./create-test-drive.dto");
class UpdateTestDriveDto extends (0, swagger_1.PartialType)(create_test_drive_dto_1.CreateTestDriveDto) {
}
exports.UpdateTestDriveDto = UpdateTestDriveDto;
