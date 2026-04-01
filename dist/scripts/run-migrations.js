"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const data_source_1 = require("../database/data-source");
async function runMigrations() {
    await data_source_1.AppDataSource.initialize();
    await data_source_1.AppDataSource.synchronize();
    const migrations = await data_source_1.AppDataSource.runMigrations();
    console.log(`Migrations executadas: ${migrations.length}`);
    for (const migration of migrations) {
        console.log(`- ${migration.name}`);
    }
    await data_source_1.AppDataSource.destroy();
}
runMigrations().catch(async (error) => {
    console.error('Erro ao executar migrations:', error);
    if (data_source_1.AppDataSource.isInitialized) {
        await data_source_1.AppDataSource.destroy();
    }
    process.exit(1);
});
