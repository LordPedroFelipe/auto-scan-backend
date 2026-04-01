"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateSaleClosureDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_sale_closure_dto_1 = require("./create-sale-closure.dto");
class UpdateSaleClosureDto extends (0, swagger_1.PartialType)(create_sale_closure_dto_1.CreateSaleClosureDto) {
}
exports.UpdateSaleClosureDto = UpdateSaleClosureDto;
