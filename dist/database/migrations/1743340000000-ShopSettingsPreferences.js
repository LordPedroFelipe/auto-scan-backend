"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShopSettingsPreferences1743340000000 = void 0;
class ShopSettingsPreferences1743340000000 {
    constructor() {
        this.name = 'ShopSettingsPreferences1743340000000';
    }
    async up(queryRunner) {
        await queryRunner.query(`
      ALTER TABLE "shops"
      ADD COLUMN IF NOT EXISTS "settingsPreferences" jsonb NOT NULL DEFAULT '{}'::jsonb
    `);
        await queryRunner.query(`
      ALTER TABLE "shops"
      ADD COLUMN IF NOT EXISTS "notificationPreferences" jsonb NOT NULL DEFAULT '[]'::jsonb
    `);
    }
    async down(queryRunner) {
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
exports.ShopSettingsPreferences1743340000000 = ShopSettingsPreferences1743340000000;
