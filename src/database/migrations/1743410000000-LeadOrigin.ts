import { MigrationInterface, QueryRunner } from 'typeorm';

export class LeadOrigin1743410000000 implements MigrationInterface {
  name = 'LeadOrigin1743410000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "leads"
      ADD COLUMN IF NOT EXISTS "origin" varchar(120)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "leads"
      DROP COLUMN IF EXISTS "origin"
    `);
  }
}
