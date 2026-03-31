import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InventorySyncService } from './inventory-sync.service';

@Injectable()
export class InventorySyncBootstrap implements OnModuleInit {
  private readonly logger = new Logger(InventorySyncBootstrap.name);

  constructor(
    private readonly inventorySyncService: InventorySyncService,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    await this.inventorySyncService.initializeSchedules();

    const runOnStartup =
      this.configService.get<string>('INVENTORY_SYNC_RUN_ON_STARTUP', 'false') ===
      'true';

    if (runOnStartup) {
      this.logger.log('Executando sincronização automática na inicialização.');
      await this.inventorySyncService.syncEnabledShops('startup');
    }
  }
}
