import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { InventorySyncService } from '../modules/inventory-sync/inventory-sync.service';

async function run() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['log', 'warn', 'error'],
  });

  try {
    const inventorySyncService = app.get(InventorySyncService);
    const shopId = process.argv[2];
    if (!shopId) {
      throw new Error('Informe o shopId como primeiro argumento para rodar a sincronizacao.');
    }
    const result = await inventorySyncService.syncShopInventory(shopId);
    console.log(JSON.stringify(result, null, 2));
  } finally {
    await app.close();
  }
}

run().catch((error) => {
  console.error('Erro ao sincronizar estoque:', error);
  process.exit(1);
});
