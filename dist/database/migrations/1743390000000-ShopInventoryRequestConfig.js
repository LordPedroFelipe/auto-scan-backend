"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShopInventoryRequestConfig1743390000000 = void 0;
class ShopInventoryRequestConfig1743390000000 {
    constructor() {
        this.name = 'ShopInventoryRequestConfig1743390000000';
    }
    async up(queryRunner) {
        await queryRunner.query(`
      ALTER TABLE "shops"
      ADD COLUMN IF NOT EXISTS "inventoryFeedMethod" character varying(10)
    `);
        await queryRunner.query(`
      ALTER TABLE "shops"
      ADD COLUMN IF NOT EXISTS "inventoryRequestBody" text
    `);
        await queryRunner.query(`
      ALTER TABLE "shops"
      ADD COLUMN IF NOT EXISTS "inventoryRequestHeaders" text
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
      ALTER TABLE "shops"
      DROP COLUMN IF EXISTS "inventoryRequestHeaders"
    `);
        await queryRunner.query(`
      ALTER TABLE "shops"
      DROP COLUMN IF EXISTS "inventoryRequestBody"
    `);
        await queryRunner.query(`
      ALTER TABLE "shops"
      DROP COLUMN IF EXISTS "inventoryFeedMethod"
    `);
    }
}
exports.ShopInventoryRequestConfig1743390000000 = ShopInventoryRequestConfig1743390000000;
