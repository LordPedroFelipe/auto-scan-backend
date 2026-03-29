import { MigrationInterface, QueryRunner } from 'typeorm';

export class VehiclePhotoVariants1743311000000 implements MigrationInterface {
  name = 'VehiclePhotoVariants1743311000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "vehicles"
      ADD COLUMN IF NOT EXISTS "originalPhotoUrls" text[] NOT NULL DEFAULT '{}',
      ADD COLUMN IF NOT EXISTS "thumbnailPhotoUrls" text[] NOT NULL DEFAULT '{}'
    `);

    await queryRunner.query(`
      UPDATE "vehicles"
      SET
        "originalPhotoUrls" = COALESCE("photoUrls", '{}'),
        "thumbnailPhotoUrls" = COALESCE("photoUrls", '{}')
      WHERE COALESCE(array_length("photoUrls", 1), 0) > 0
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "vehicles"
      DROP COLUMN IF EXISTS "originalPhotoUrls",
      DROP COLUMN IF EXISTS "thumbnailPhotoUrls"
    `);
  }
}
