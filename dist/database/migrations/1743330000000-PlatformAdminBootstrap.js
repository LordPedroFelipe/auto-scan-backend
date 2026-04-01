"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlatformAdminBootstrap1743330000000 = void 0;
const bcrypt = __importStar(require("bcrypt"));
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
class PlatformAdminBootstrap1743330000000 {
    constructor() {
        this.name = 'PlatformAdminBootstrap1743330000000';
    }
    async up(queryRunner) {
        const passwordHash = await bcrypt.hash(PLATFORM_ADMIN_PASSWORD, 10);
        const now = new Date();
        await queryRunner.query(`
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
      `, [
            PLATFORM_ADMIN_USER_ID,
            'Admin Geral ScanDrive',
            PLATFORM_ADMIN_EMAIL,
            passwordHash,
            PLATFORM_ADMIN_ROLES,
            PLATFORM_ADMIN_CLAIMS,
            now,
        ]);
    }
    async down(queryRunner) {
        await queryRunner.query(`DELETE FROM "users" WHERE "email" = $1`, [
            PLATFORM_ADMIN_EMAIL,
        ]);
    }
}
exports.PlatformAdminBootstrap1743330000000 = PlatformAdminBootstrap1743330000000;
