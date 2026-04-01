"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddIsConsignedToVehicle1743420000000 = void 0;
class AddIsConsignedToVehicle1743420000000 {
    constructor() {
        this.name = 'AddIsConsignedToVehicle1743420000000';
    }
    async up(queryRunner) {
        await queryRunner.query(`
      ALTER TABLE "vehicles"
      ADD COLUMN IF NOT EXISTS "isConsigned" boolean NOT NULL DEFAULT false
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
      ALTER TABLE "vehicles"
      DROP COLUMN IF EXISTS "isConsigned"
    `);
    }
}
exports.AddIsConsignedToVehicle1743420000000 = AddIsConsignedToVehicle1743420000000;
