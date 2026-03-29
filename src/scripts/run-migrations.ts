import 'dotenv/config';
import { AppDataSource } from '../database/data-source';

async function runMigrations() {
  await AppDataSource.initialize();
  await AppDataSource.synchronize();
  const migrations = await AppDataSource.runMigrations();

  console.log(`Migrations executadas: ${migrations.length}`);
  for (const migration of migrations) {
    console.log(`- ${migration.name}`);
  }

  await AppDataSource.destroy();
}

runMigrations().catch(async (error) => {
  console.error('Erro ao executar migrations:', error);
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }
  process.exit(1);
});
