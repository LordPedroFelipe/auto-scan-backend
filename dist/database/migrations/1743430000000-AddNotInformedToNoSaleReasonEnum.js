"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddNotInformedToNoSaleReasonEnum1743430000000 = void 0;
class AddNotInformedToNoSaleReasonEnum1743430000000 {
    constructor() {
        this.name = 'AddNotInformedToNoSaleReasonEnum1743430000000';
    }
    async up(queryRunner) {
        await queryRunner.query(`
      ALTER TYPE "public"."sale_closures_nosalereason_enum" ADD VALUE 'NotInformed';
    `);
    }
    async down(queryRunner) {
        // Note: PostgreSQL does not support removing enum values directly
        // This would require recreating the enum without the value
        // For simplicity, we'll leave it as is for down migration
    }
}
exports.AddNotInformedToNoSaleReasonEnum1743430000000 = AddNotInformedToNoSaleReasonEnum1743430000000;
