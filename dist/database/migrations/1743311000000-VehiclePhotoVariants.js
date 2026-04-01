"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VehiclePhotoVariants1743311000000 = void 0;
class VehiclePhotoVariants1743311000000 {
    constructor() {
        this.name = 'VehiclePhotoVariants1743311000000';
    }
    async up(queryRunner) {
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
    async down(queryRunner) {
        await queryRunner.query(`
      ALTER TABLE "vehicles"
      DROP COLUMN IF EXISTS "originalPhotoUrls",
      DROP COLUMN IF EXISTS "thumbnailPhotoUrls"
    `);
    }
}
exports.VehiclePhotoVariants1743311000000 = VehiclePhotoVariants1743311000000;
