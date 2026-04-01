"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeadOrigin1743410000000 = void 0;
class LeadOrigin1743410000000 {
    constructor() {
        this.name = 'LeadOrigin1743410000000';
    }
    async up(queryRunner) {
        await queryRunner.query(`
      ALTER TABLE "leads"
      ADD COLUMN IF NOT EXISTS "origin" varchar(120)
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
      ALTER TABLE "leads"
      DROP COLUMN IF EXISTS "origin"
    `);
    }
}
exports.LeadOrigin1743410000000 = LeadOrigin1743410000000;
