import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsConsignedToVehicle1743420000000 implements MigrationInterface {
  name = 'AddIsConsignedToVehicle1743420000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "vehicles"
      ADD COLUMN IF NOT EXISTS "isConsigned" boolean NOT NULL DEFAULT false
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "vehicles"
      DROP COLUMN IF EXISTS "isConsigned"
    `);
  }
}