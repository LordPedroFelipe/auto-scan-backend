import { MigrationInterface, QueryRunner } from 'typeorm';

export class SaleClosures1743400000000 implements MigrationInterface {
  name = 'SaleClosures1743400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."sale_closures_outcometype_enum" AS ENUM('Sale', 'NoSale');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."sale_closures_paymentmethod_enum" AS ENUM('Cash', 'Financing', 'Consorcio', 'Pix', 'BankTransfer', 'CreditCard', 'TradeIn', 'Other');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."sale_closures_gifttype_enum" AS ENUM('None', 'FuelTank', 'Documentation', 'Warranty', 'AccessoryKit', 'ProtectionFilm', 'InsuranceBonus', 'ServicePackage', 'Other');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."sale_closures_nosalereason_enum" AS ENUM('Price', 'CreditDenied', 'ChoseCompetitor', 'NoContact', 'StockUnavailable', 'PostponedDecision', 'VehicleMismatch', 'Other');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "sale_closures" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "shopId" uuid,
        "leadId" uuid NOT NULL,
        "vehicleId" uuid,
        "sellerId" uuid,
        "testDriveId" uuid,
        "outcomeType" "public"."sale_closures_outcometype_enum" NOT NULL DEFAULT 'NoSale',
        "paymentMethod" "public"."sale_closures_paymentmethod_enum",
        "giftType" "public"."sale_closures_gifttype_enum" NOT NULL DEFAULT 'None',
        "noSaleReason" "public"."sale_closures_nosalereason_enum",
        "listPrice" numeric(12,2),
        "salePrice" numeric(12,2),
        "discountValue" numeric(12,2),
        "discountPercent" numeric(5,2),
        "entryValue" numeric(12,2),
        "installments" integer,
        "commissionValue" numeric(12,2),
        "tradeInAccepted" boolean NOT NULL DEFAULT false,
        "tradeInDescription" text,
        "competitorName" character varying(160),
        "accessoryDescription" text,
        "closedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "notes" text,
        "metadata" jsonb,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_sale_closures_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_sale_closure_lead" UNIQUE ("leadId")
      )
    `);

    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_sale_closure_shop_closed_at" ON "sale_closures" ("shopId", "closedAt") `);
    await queryRunner.query(`DO $$ BEGIN ALTER TABLE "sale_closures" ADD CONSTRAINT "FK_sale_closures_shop" FOREIGN KEY ("shopId") REFERENCES "shops"("id") ON DELETE SET NULL ON UPDATE NO ACTION; EXCEPTION WHEN duplicate_object THEN null; END $$;`);
    await queryRunner.query(`DO $$ BEGIN ALTER TABLE "sale_closures" ADD CONSTRAINT "FK_sale_closures_lead" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE NO ACTION; EXCEPTION WHEN duplicate_object THEN null; END $$;`);
    await queryRunner.query(`DO $$ BEGIN ALTER TABLE "sale_closures" ADD CONSTRAINT "FK_sale_closures_vehicle" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE SET NULL ON UPDATE NO ACTION; EXCEPTION WHEN duplicate_object THEN null; END $$;`);
    await queryRunner.query(`DO $$ BEGIN ALTER TABLE "sale_closures" ADD CONSTRAINT "FK_sale_closures_seller" FOREIGN KEY ("sellerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION; EXCEPTION WHEN duplicate_object THEN null; END $$;`);
    await queryRunner.query(`DO $$ BEGIN ALTER TABLE "sale_closures" ADD CONSTRAINT "FK_sale_closures_test_drive" FOREIGN KEY ("testDriveId") REFERENCES "test_drives"("id") ON DELETE SET NULL ON UPDATE NO ACTION; EXCEPTION WHEN duplicate_object THEN null; END $$;`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "sale_closures" DROP CONSTRAINT IF EXISTS "FK_sale_closures_test_drive"`);
    await queryRunner.query(`ALTER TABLE "sale_closures" DROP CONSTRAINT IF EXISTS "FK_sale_closures_seller"`);
    await queryRunner.query(`ALTER TABLE "sale_closures" DROP CONSTRAINT IF EXISTS "FK_sale_closures_vehicle"`);
    await queryRunner.query(`ALTER TABLE "sale_closures" DROP CONSTRAINT IF EXISTS "FK_sale_closures_lead"`);
    await queryRunner.query(`ALTER TABLE "sale_closures" DROP CONSTRAINT IF EXISTS "FK_sale_closures_shop"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_sale_closure_shop_closed_at"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "sale_closures"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."sale_closures_nosalereason_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."sale_closures_gifttype_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."sale_closures_paymentmethod_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."sale_closures_outcometype_enum"`);
  }
}
