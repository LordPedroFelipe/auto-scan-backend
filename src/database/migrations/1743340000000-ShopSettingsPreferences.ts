import { MigrationInterface, QueryRunner } from 'typeorm';

export class ShopSettingsPreferences1743340000000 implements MigrationInterface {
  name = 'ShopSettingsPreferences1743340000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "shops"
      ADD COLUMN IF NOT EXISTS "settingsPreferences" jsonb NOT NULL DEFAULT '{}'::jsonb
    `);

    await queryRunner.query(`
      ALTER TABLE "shops"
      ADD COLUMN IF NOT EXISTS "notificationPreferences" jsonb NOT NULL DEFAULT '[]'::jsonb
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "shops"
      DROP COLUMN IF EXISTS "notificationPreferences"
    `);

    await queryRunner.query(`
      ALTER TABLE "shops"
      DROP COLUMN IF EXISTS "settingsPreferences"
    `);
  }
}
