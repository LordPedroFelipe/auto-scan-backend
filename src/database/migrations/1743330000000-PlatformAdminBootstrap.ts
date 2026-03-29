import * as bcrypt from 'bcrypt';
import { MigrationInterface, QueryRunner } from 'typeorm';

const PLATFORM_ADMIN_USER_ID = '8c13a5ce-6d89-4b93-a6e8-4f4c4a8a1001';
const PLATFORM_ADMIN_EMAIL = 'admin@scandrive.com';
const PLATFORM_ADMIN_PASSWORD = 'Admin@123';
const PLATFORM_ADMIN_ROLES = 'Admin';
const PLATFORM_ADMIN_CLAIMS = [
  'Module.Users:Permission.View',
  'Module.Users:Permission.Create',
  'Module.Users:Permission.Edit',
  'Module.Users:Permission.Delete',
  'Module.Shops:Permission.View',
  'Module.Shops:Permission.Create',
  'Module.Shops:Permission.Edit',
  'Module.Vehicles:Permission.View',
  'Module.Vehicles:Permission.Create',
  'Module.Vehicles:Permission.Edit',
  'Module.Vehicles:Permission.Delete',
  'Module.Leads:Permission.View',
  'Module.Leads:Permission.Create',
  'Module.Leads:Permission.Edit',
  'Module.TestDrives:Permission.View',
  'Module.TestDrives:Permission.Create',
  'Module.Reports:Permission.View',
  'Module.Settings:Permission.View',
].join(',');

export class PlatformAdminBootstrap1743330000000 implements MigrationInterface {
  name = 'PlatformAdminBootstrap1743330000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const passwordHash = await bcrypt.hash(PLATFORM_ADMIN_PASSWORD, 10);
    const now = new Date();

    await queryRunner.query(
      `
      INSERT INTO "users" (
        "id",
        "userName",
        "email",
        "phoneNumber",
        "passwordHash",
        "emailConfirmed",
        "lockoutEnabled",
        "accessFailedCount",
        "isActive",
        "passwordResetTokenHash",
        "passwordResetExpiresAt",
        "welcomeEmailSentAt",
        "roles",
        "claims",
        "shopId",
        "createdAt",
        "updatedAt"
      ) VALUES (
        $1, $2, $3, NULL, $4,
        true, false, 0, true,
        NULL, NULL, NULL,
        $5, $6, NULL, $7, $7
      )
      ON CONFLICT ("email") DO UPDATE SET
        "userName" = EXCLUDED."userName",
        "passwordHash" = EXCLUDED."passwordHash",
        "emailConfirmed" = EXCLUDED."emailConfirmed",
        "lockoutEnabled" = EXCLUDED."lockoutEnabled",
        "accessFailedCount" = EXCLUDED."accessFailedCount",
        "isActive" = EXCLUDED."isActive",
        "roles" = EXCLUDED."roles",
        "claims" = EXCLUDED."claims",
        "shopId" = EXCLUDED."shopId",
        "updatedAt" = EXCLUDED."updatedAt"
      `,
      [
        PLATFORM_ADMIN_USER_ID,
        'Admin Geral ScanDrive',
        PLATFORM_ADMIN_EMAIL,
        passwordHash,
        PLATFORM_ADMIN_ROLES,
        PLATFORM_ADMIN_CLAIMS,
        now,
      ],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "users" WHERE "email" = $1`, [
      PLATFORM_ADMIN_EMAIL,
    ]);
  }
}
