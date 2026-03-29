import * as bcrypt from 'bcrypt';
import { MigrationInterface, QueryRunner } from 'typeorm';
import {
  KAFKA_MULTIMARCAS_DEFAULT_CRON,
  KAFKA_MULTIMARCAS_FEED_URL,
  KAFKA_MULTIMARCAS_MASTER_USER_ID,
  KAFKA_MULTIMARCAS_SELLER_USER_ID,
  KAFKA_MULTIMARCAS_SHOP_ID,
  KAFKA_MULTIMARCAS_SOURCE_CODE,
} from '../../modules/inventory-sync/inventory-sync.constants';

export class KafkaBootstrap1743300000000 implements MigrationInterface {
  name = 'KafkaBootstrap1743300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "shops"
      ADD COLUMN IF NOT EXISTS "inventoryFeedUrl" character varying(500),
      ADD COLUMN IF NOT EXISTS "inventorySourceCode" character varying(80),
      ADD COLUMN IF NOT EXISTS "inventorySyncCron" character varying(120),
      ADD COLUMN IF NOT EXISTS "inventorySyncEnabled" boolean NOT NULL DEFAULT false,
      ADD COLUMN IF NOT EXISTS "inventoryLastSyncAt" TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS "inventoryLastSyncStatus" character varying(40),
      ADD COLUMN IF NOT EXISTS "inventoryLastSyncError" text
    `);

    await queryRunner.query(`
      ALTER TABLE "vehicles"
      ADD COLUMN IF NOT EXISTS "isActive" boolean NOT NULL DEFAULT true,
      ADD COLUMN IF NOT EXISTS "externalVehicleId" character varying(80),
      ADD COLUMN IF NOT EXISTS "externalImportId" character varying(80),
      ADD COLUMN IF NOT EXISTS "integrationSource" character varying(60),
      ADD COLUMN IF NOT EXISTS "externalRaw" jsonb,
      ADD COLUMN IF NOT EXISTS "sourceUpdatedAt" TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS "sourceLastSeenAt" TIMESTAMPTZ
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "IDX_vehicle_shop_external"
      ON "vehicles" ("shopId", "externalVehicleId")
      WHERE "externalVehicleId" IS NOT NULL
    `);

    const masterPasswordHash = await bcrypt.hash('KafkaMaster@123', 10);
    const sellerPasswordHash = await bcrypt.hash('KafkaSeller@123', 10);
    const now = new Date();

    await queryRunner.query(
      `
      INSERT INTO "shops" (
        "id", "name", "description", "email", "phoneNumber", "addressLine",
        "city", "state", "zipCode", "qrCodeLimit",
        "inventoryFeedUrl", "inventorySourceCode", "inventorySyncCron",
        "inventorySyncEnabled", "ownerId", "isActive", "isDeleted",
        "createdAt", "updatedAt"
      ) VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9, $10,
        $11, $12, $13,
        true, NULL, true, false,
        $14, $14
      )
      ON CONFLICT ("id") DO UPDATE SET
        "name" = EXCLUDED."name",
        "description" = EXCLUDED."description",
        "email" = EXCLUDED."email",
        "phoneNumber" = EXCLUDED."phoneNumber",
        "addressLine" = EXCLUDED."addressLine",
        "city" = EXCLUDED."city",
        "state" = EXCLUDED."state",
        "zipCode" = EXCLUDED."zipCode",
        "qrCodeLimit" = EXCLUDED."qrCodeLimit",
        "inventoryFeedUrl" = EXCLUDED."inventoryFeedUrl",
        "inventorySourceCode" = EXCLUDED."inventorySourceCode",
        "inventorySyncCron" = EXCLUDED."inventorySyncCron",
        "inventorySyncEnabled" = EXCLUDED."inventorySyncEnabled",
        "isActive" = EXCLUDED."isActive",
        "isDeleted" = EXCLUDED."isDeleted",
        "updatedAt" = EXCLUDED."updatedAt"
      `,
      [
        KAFKA_MULTIMARCAS_SHOP_ID,
        'Kafka Multimarcas',
        'Primeira loja cliente integrada via feed JSON de estoque.',
        'contato@kafkamultimarcas.local',
        '(47) 3227-1060',
        'Rua Santa Catarina, 1318 - Floresta',
        'Joinville',
        'SC',
        '83308-070',
        500,
        KAFKA_MULTIMARCAS_FEED_URL,
        KAFKA_MULTIMARCAS_SOURCE_CODE,
        KAFKA_MULTIMARCAS_DEFAULT_CRON,
        now,
      ],
    );

    await queryRunner.query(
      `
      INSERT INTO "users" (
        "id", "userName", "email", "phoneNumber", "passwordHash",
        "emailConfirmed", "lockoutEnabled", "accessFailedCount", "isActive",
        "roles", "claims", "shopId", "createdAt", "updatedAt"
      ) VALUES (
        $1, $2, $3, $4, $5,
        true, false, 0, true,
        $6, $7, $8, $9, $9
      )
      ON CONFLICT ("id") DO UPDATE SET
        "userName" = EXCLUDED."userName",
        "email" = EXCLUDED."email",
        "phoneNumber" = EXCLUDED."phoneNumber",
        "passwordHash" = EXCLUDED."passwordHash",
        "roles" = EXCLUDED."roles",
        "claims" = EXCLUDED."claims",
        "shopId" = EXCLUDED."shopId",
        "updatedAt" = EXCLUDED."updatedAt"
      `,
      [
        KAFKA_MULTIMARCAS_MASTER_USER_ID,
        'Kafka Master',
        'master@kafkamultimarcas.local',
        '(47) 3227-1060',
        masterPasswordHash,
        'Admin,ShopOwner',
        'Module.Users:Permission.View,Module.Users:Permission.Create,Module.Users:Permission.Edit,Module.Shops:Permission.View,Module.Shops:Permission.Edit,Module.Vehicles:Permission.View,Module.Vehicles:Permission.Create,Module.Vehicles:Permission.Edit,Module.Leads:Permission.View,Module.TestDrives:Permission.View,Module.Reports:Permission.View',
        KAFKA_MULTIMARCAS_SHOP_ID,
        now,
      ],
    );

    await queryRunner.query(
      `
      INSERT INTO "users" (
        "id", "userName", "email", "phoneNumber", "passwordHash",
        "emailConfirmed", "lockoutEnabled", "accessFailedCount", "isActive",
        "roles", "claims", "shopId", "createdAt", "updatedAt"
      ) VALUES (
        $1, $2, $3, $4, $5,
        true, false, 0, true,
        $6, $7, $8, $9, $9
      )
      ON CONFLICT ("id") DO UPDATE SET
        "userName" = EXCLUDED."userName",
        "email" = EXCLUDED."email",
        "phoneNumber" = EXCLUDED."phoneNumber",
        "passwordHash" = EXCLUDED."passwordHash",
        "roles" = EXCLUDED."roles",
        "claims" = EXCLUDED."claims",
        "shopId" = EXCLUDED."shopId",
        "updatedAt" = EXCLUDED."updatedAt"
      `,
      [
        KAFKA_MULTIMARCAS_SELLER_USER_ID,
        'Kafka Vendas',
        'vendedor@kafkamultimarcas.local',
        '(47) 99644-0035',
        sellerPasswordHash,
        'ShopSeller',
        'Module.Vehicles:Permission.View,Module.Leads:Permission.View,Module.TestDrives:Permission.View',
        KAFKA_MULTIMARCAS_SHOP_ID,
        now,
      ],
    );

    await queryRunner.query(
      `UPDATE "shops" SET "ownerId" = $2, "updatedAt" = $3 WHERE "id" = $1`,
      [KAFKA_MULTIMARCAS_SHOP_ID, KAFKA_MULTIMARCAS_MASTER_USER_ID, now],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "shops" SET "ownerId" = NULL WHERE "id" = $1`,
      [KAFKA_MULTIMARCAS_SHOP_ID],
    );
    await queryRunner.query(
      `UPDATE "users" SET "shopId" = NULL WHERE "id" IN ($1, $2)`,
      [KAFKA_MULTIMARCAS_MASTER_USER_ID, KAFKA_MULTIMARCAS_SELLER_USER_ID],
    );
    await queryRunner.query(`DELETE FROM "users" WHERE "id" IN ($1, $2)`, [
      KAFKA_MULTIMARCAS_MASTER_USER_ID,
      KAFKA_MULTIMARCAS_SELLER_USER_ID,
    ]);
    await queryRunner.query(`DELETE FROM "shops" WHERE "id" = $1`, [
      KAFKA_MULTIMARCAS_SHOP_ID,
    ]);
  }
}

