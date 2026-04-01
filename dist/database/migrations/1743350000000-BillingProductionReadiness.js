"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillingProductionReadiness1743350000000 = void 0;
class BillingProductionReadiness1743350000000 {
    constructor() {
        this.name = 'BillingProductionReadiness1743350000000';
    }
    async up(queryRunner) {
        await queryRunner.query(`
      ALTER TABLE "shops"
      ADD COLUMN IF NOT EXISTS "billingCustomerProvider" varchar(40) NULL
    `);
        await queryRunner.query(`
      ALTER TABLE "shops"
      ADD COLUMN IF NOT EXISTS "billingCustomerExternalId" varchar(120) NULL
    `);
        await queryRunner.query(`
      ALTER TABLE "shops"
      ADD COLUMN IF NOT EXISTS "billingCustomerSyncedAt" timestamptz NULL
    `);
        await queryRunner.query(`
      ALTER TABLE "subscription_payments"
      ADD COLUMN IF NOT EXISTS "billingProvider" varchar(40) NULL
    `);
        await queryRunner.query(`
      ALTER TABLE "subscription_payments"
      ADD COLUMN IF NOT EXISTS "paymentMethod" varchar(80) NULL
    `);
        await queryRunner.query(`
      ALTER TABLE "subscription_payments"
      ADD COLUMN IF NOT EXISTS "providerPaymentId" varchar(160) NULL
    `);
        await queryRunner.query(`
      ALTER TABLE "subscription_payments"
      ADD COLUMN IF NOT EXISTS "providerCustomerId" varchar(160) NULL
    `);
        await queryRunner.query(`
      ALTER TABLE "subscription_payments"
      ADD COLUMN IF NOT EXISTS "externalReference" varchar(160) NULL
    `);
        await queryRunner.query(`
      ALTER TABLE "subscription_payments"
      ADD COLUMN IF NOT EXISTS "pixQrCode" varchar(255) NULL
    `);
        await queryRunner.query(`
      ALTER TABLE "subscription_payments"
      ADD COLUMN IF NOT EXISTS "pixCopyPaste" text NULL
    `);
        await queryRunner.query(`
      ALTER TABLE "subscription_payments"
      ADD COLUMN IF NOT EXISTS "dueDate" timestamp NULL
    `);
        await queryRunner.query(`
      ALTER TABLE "subscription_payments"
      ADD COLUMN IF NOT EXISTS "paidAt" timestamp NULL
    `);
        await queryRunner.query(`
      ALTER TABLE "subscription_payments"
      ADD COLUMN IF NOT EXISTS "providerPayload" jsonb NULL
    `);
        await queryRunner.query(`
      ALTER TABLE "subscription_payments"
      ADD COLUMN IF NOT EXISTS "updatedAt" timestamp NOT NULL DEFAULT now()
    `);
        await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_subscription_payments_providerPaymentId"
      ON "subscription_payments" ("providerPaymentId")
    `);
        await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_subscription_payments_externalReference"
      ON "subscription_payments" ("externalReference")
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_subscription_payments_externalReference"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_subscription_payments_providerPaymentId"`);
        await queryRunner.query(`ALTER TABLE "subscription_payments" DROP COLUMN IF EXISTS "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "subscription_payments" DROP COLUMN IF EXISTS "providerPayload"`);
        await queryRunner.query(`ALTER TABLE "subscription_payments" DROP COLUMN IF EXISTS "paidAt"`);
        await queryRunner.query(`ALTER TABLE "subscription_payments" DROP COLUMN IF EXISTS "dueDate"`);
        await queryRunner.query(`ALTER TABLE "subscription_payments" DROP COLUMN IF EXISTS "pixCopyPaste"`);
        await queryRunner.query(`ALTER TABLE "subscription_payments" DROP COLUMN IF EXISTS "pixQrCode"`);
        await queryRunner.query(`ALTER TABLE "subscription_payments" DROP COLUMN IF EXISTS "externalReference"`);
        await queryRunner.query(`ALTER TABLE "subscription_payments" DROP COLUMN IF EXISTS "providerCustomerId"`);
        await queryRunner.query(`ALTER TABLE "subscription_payments" DROP COLUMN IF EXISTS "providerPaymentId"`);
        await queryRunner.query(`ALTER TABLE "subscription_payments" DROP COLUMN IF EXISTS "paymentMethod"`);
        await queryRunner.query(`ALTER TABLE "subscription_payments" DROP COLUMN IF EXISTS "billingProvider"`);
        await queryRunner.query(`ALTER TABLE "shops" DROP COLUMN IF EXISTS "billingCustomerSyncedAt"`);
        await queryRunner.query(`ALTER TABLE "shops" DROP COLUMN IF EXISTS "billingCustomerExternalId"`);
        await queryRunner.query(`ALTER TABLE "shops" DROP COLUMN IF EXISTS "billingCustomerProvider"`);
    }
}
exports.BillingProductionReadiness1743350000000 = BillingProductionReadiness1743350000000;
