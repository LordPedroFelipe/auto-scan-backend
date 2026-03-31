import { MigrationInterface, QueryRunner } from 'typeorm';

export class ShopInventoryIntegrationSettings1743370000000 implements MigrationInterface {
  name = 'ShopInventoryIntegrationSettings1743370000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
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

  public async down(queryRunner: QueryRunner): Promise<void> {
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
