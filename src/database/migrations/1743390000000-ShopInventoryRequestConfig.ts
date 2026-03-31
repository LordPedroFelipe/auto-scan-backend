import { MigrationInterface, QueryRunner } from 'typeorm';

export class ShopInventoryRequestConfig1743390000000 implements MigrationInterface {
  name = 'ShopInventoryRequestConfig1743390000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
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

  public async down(queryRunner: QueryRunner): Promise<void> {
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
