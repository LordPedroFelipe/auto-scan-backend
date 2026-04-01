"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventorySyncLogs1743380000000 = void 0;
class InventorySyncLogs1743380000000 {
    constructor() {
        this.name = 'InventorySyncLogs1743380000000';
    }
    async up(queryRunner) {
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "inventory_sync_logs" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "shopId" uuid NOT NULL,
        "shopName" character varying(160) NOT NULL,
        "inventoryFeedUrl" character varying(500),
        "inventorySourceCode" character varying(80),
        "inventorySourceName" character varying(120),
        "inventorySyncCron" character varying(120),
        "inventorySyncEnabled" boolean NOT NULL DEFAULT false,
        "triggerType" character varying(20) NOT NULL,
        "status" character varying(20) NOT NULL,
        "imported" integer NOT NULL DEFAULT 0,
        "created" integer NOT NULL DEFAULT 0,
        "updated" integer NOT NULL DEFAULT 0,
        "deactivated" integer NOT NULL DEFAULT 0,
        "totalInFeed" integer NOT NULL DEFAULT 0,
        "activeIntegratedVehicles" integer NOT NULL DEFAULT 0,
        "durationMs" integer NOT NULL DEFAULT 0,
        "startedAt" TIMESTAMPTZ NOT NULL,
        "finishedAt" TIMESTAMPTZ NOT NULL,
        "errorMessage" text,
        "metadata" jsonb NOT NULL DEFAULT '{}'::jsonb,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_inventory_sync_logs_id" PRIMARY KEY ("id")
      )
    `);
        await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_inventory_sync_logs_shop_started"
      ON "inventory_sync_logs" ("shopId", "startedAt")
    `);
        await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_inventory_sync_logs_status_started"
      ON "inventory_sync_logs" ("status", "startedAt")
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_inventory_sync_logs_status_started"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_inventory_sync_logs_shop_started"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "inventory_sync_logs"`);
    }
}
exports.InventorySyncLogs1743380000000 = InventorySyncLogs1743380000000;
