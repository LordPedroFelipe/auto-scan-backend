"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const core_1 = require("@nestjs/core");
const app_module_1 = require("../app.module");
const inventory_sync_service_1 = require("../modules/inventory-sync/inventory-sync.service");
async function run() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule, {
        logger: ['log', 'warn', 'error'],
    });
    try {
        const inventorySyncService = app.get(inventory_sync_service_1.InventorySyncService);
        const shopId = process.argv[2];
        if (!shopId) {
            throw new Error('Informe o shopId como primeiro argumento para rodar a sincronizacao.');
        }
        const result = await inventorySyncService.syncShopInventory(shopId);
        console.log(JSON.stringify(result, null, 2));
    }
    finally {
        await app.close();
    }
}
run().catch((error) => {
    console.error('Erro ao sincronizar estoque:', error);
    process.exit(1);
});
