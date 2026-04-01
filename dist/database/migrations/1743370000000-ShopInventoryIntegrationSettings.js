"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShopInventoryIntegrationSettings1743370000000 = void 0;
class ShopInventoryIntegrationSettings1743370000000 {
    constructor() {
        this.name = 'ShopInventoryIntegrationSettings1743370000000';
    }
    async up(queryRunner) {
        await queryRunner.query(`
      ALTER TABLE "shops"
      ADD COLUMN IF NOT EXISTS "inventorySourceName" character varying(120)
    `);
        await queryRunner.query(`
      ALTER TABLE "shops"
      ADD COLUMN IF NOT EXISTS "inventoryImageBucketBaseUrl" character varying(500)
    `);
        await queryRunner.query(`
      ALTER TABLE "shops"
      ADD COLUMN IF NOT EXISTS "inventoryMasterUserId" uuid
    `);
        await queryRunner.query(`
      ALTER TABLE "shops"
      ADD COLUMN IF NOT EXISTS "inventorySellerUserId" uuid
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
      ALTER TABLE "shops"
      DROP COLUMN IF EXISTS "inventorySellerUserId"
    `);
        await queryRunner.query(`
      ALTER TABLE "shops"
      DROP COLUMN IF EXISTS "inventoryMasterUserId"
    `);
        await queryRunner.query(`
      ALTER TABLE "shops"
      DROP COLUMN IF EXISTS "inventoryImageBucketBaseUrl"
    `);
        await queryRunner.query(`
      ALTER TABLE "shops"
      DROP COLUMN IF EXISTS "inventorySourceName"
    `);
    }
}
exports.ShopInventoryIntegrationSettings1743370000000 = ShopInventoryIntegrationSettings1743370000000;
