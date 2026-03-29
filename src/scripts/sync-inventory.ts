import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { KAFKA_MULTIMARCAS_SHOP_ID } from '../modules/inventory-sync/inventory-sync.constants';
import { InventorySyncService } from '../modules/inventory-sync/inventory-sync.service';

async function run() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['log', 'warn', 'error'],
  });

  try {
    const inventorySyncService = app.get(InventorySyncService);
    const shopId = process.argv[2] || KAFKA_MULTIMARCAS_SHOP_ID;
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
