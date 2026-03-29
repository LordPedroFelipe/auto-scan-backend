import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CronJob } from 'cron';
import { SchedulerRegistry } from '@nestjs/schedule';
import { Repository } from 'typeorm';
import { ShopEntity } from '../shops/entities/shop.entity';
import { VehicleEntity } from '../vehicles/entities/vehicle.entity';
import {
  KAFKA_MULTIMARCAS_DEFAULT_CRON,
  KAFKA_MULTIMARCAS_FEED_URL,
  KAFKA_MULTIMARCAS_IMAGE_BUCKET_BASE_URL,
  KAFKA_MULTIMARCAS_SOURCE_NAME,
} from './inventory-sync.constants';
import {
  ExternalInventoryFeed,
  ExternalVehicleRecord,
  InventorySyncResult,
} from './inventory-sync.types';

@Injectable()
export class InventorySyncService {
  private readonly logger = new Logger(InventorySyncService.name);

  constructor(
    @InjectRepository(ShopEntity)
    private readonly shopsRepository: Repository<ShopEntity>,
    @InjectRepository(VehicleEntity)
    private readonly vehiclesRepository: Repository<VehicleEntity>,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {}

  async initializeSchedules() {
    const cronJobs = this.schedulerRegistry.getCronJobs();
    for (const [name] of cronJobs) {
      if (name.startsWith('inventory-sync:')) {
        this.schedulerRegistry.deleteCronJob(name);
      }
    }

    const shops = await this.shopsRepository.find({
      where: {
        inventorySyncEnabled: true,
      },
      order: {
        name: 'ASC',
      },
    });

    for (const shop of shops) {
      this.registerShopCron(shop);
    }
  }

  async syncEnabledShops() {
    const shops = await this.shopsRepository.find({
      where: {
        inventorySyncEnabled: true,
      },
      order: {
        name: 'ASC',
      },
    });

    const results: InventorySyncResult[] = [];
    for (const shop of shops) {
      results.push(await this.syncShopInventory(shop.id));
    }

    return results;
  }

  async getShopSyncStatus(shopId: string) {
    const shop = await this.shopsRepository.findOne({
      where: { id: shopId },
      select: {
        id: true,
        name: true,
        inventoryFeedUrl: true,
        inventorySourceCode: true,
        inventorySyncCron: true,
        inventorySyncEnabled: true,
        inventoryLastSyncAt: true,
        inventoryLastSyncStatus: true,
        inventoryLastSyncError: true,
      },
    });

    if (!shop) {
      throw new NotFoundException('Loja nÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¾Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â£o encontrada para sincronizaÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¾Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¾Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â£o.');
    }

    const activeVehicles = await this.vehiclesRepository.count({
      where: {
        shopId,
        isActive: true,
        integrationSource: KAFKA_MULTIMARCAS_SOURCE_NAME,
      },
    });

    return {
      shopId: shop.id,
      shopName: shop.name,
      inventoryFeedUrl: shop.inventoryFeedUrl,
      inventorySourceCode: shop.inventorySourceCode,
      inventorySyncCron: shop.inventorySyncCron ?? KAFKA_MULTIMARCAS_DEFAULT_CRON,
      inventorySyncEnabled: shop.inventorySyncEnabled,
      inventoryLastSyncAt: shop.inventoryLastSyncAt,
      inventoryLastSyncStatus: shop.inventoryLastSyncStatus,
      inventoryLastSyncError: shop.inventoryLastSyncError,
      activeIntegratedVehicles: activeVehicles,
    };
  }

  async syncShopInventory(shopId: string): Promise<InventorySyncResult> {
    const shop = await this.shopsRepository.findOne({
      where: { id: shopId },
    });

    if (!shop) {
      throw new NotFoundException('Loja nÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¾Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â£o encontrada para sincronizaÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¾Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¾Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â£o.');
    }

    try {
      const feed = await this.fetchFeed(shop.inventoryFeedUrl ?? KAFKA_MULTIMARCAS_FEED_URL);
      const now = new Date();
      const activeRecords = (feed.veiculos ?? []).filter(
        (record) => record.situacao === '1' && !!record.cod_veiculo,
      );

      const existingVehicles = await this.vehiclesRepository.find({
        where: {
          shopId,
          integrationSource: KAFKA_MULTIMARCAS_SOURCE_NAME,
        },
      });

      const existingByExternalId = new Map(
        existingVehicles
          .filter((vehicle) => !!vehicle.externalVehicleId)
          .map((vehicle) => [vehicle.externalVehicleId as string, vehicle]),
      );

      const vehiclesToSave: VehicleEntity[] = [];
      const seenExternalIds = new Set<string>();
      let created = 0;
      let updated = 0;

      for (const record of activeRecords) {
        const externalVehicleId = String(record.cod_veiculo);
        seenExternalIds.add(externalVehicleId);

        const existing = existingByExternalId.get(externalVehicleId);
        const entity = existing ?? this.vehiclesRepository.create();
        const isNew = !existing;

        this.applyExternalVehicle(entity, shop, feed, record, now);
        vehiclesToSave.push(entity);

        if (isNew) created += 1;
        else updated += 1;
      }

      if (vehiclesToSave.length > 0) {
        await this.vehiclesRepository.save(vehiclesToSave);
      }

      const vehiclesToDeactivate = existingVehicles.filter(
        (vehicle) => vehicle.externalVehicleId && !seenExternalIds.has(vehicle.externalVehicleId),
      );

      if (vehiclesToDeactivate.length > 0) {
        for (const vehicle of vehiclesToDeactivate) {
          vehicle.isActive = false;
          vehicle.isOnOffer = false;
          vehicle.isHighlighted = false;
          vehicle.sourceLastSeenAt = now;
        }

        await this.vehiclesRepository.save(vehiclesToDeactivate);
      }

      shop.inventoryLastSyncAt = now;
      shop.inventoryLastSyncStatus = 'success';
      shop.inventoryLastSyncError = null;
      await this.shopsRepository.save(shop);

      const result: InventorySyncResult = {
        shopId: shop.id,
        shopName: shop.name,
        imported: activeRecords.length,
        created,
        updated,
        deactivated: vehiclesToDeactivate.length,
        totalInFeed: feed.total ?? activeRecords.length,
        syncedAt: now.toISOString(),
      };

      this.logger.log(
        `Estoque sincronizado para ${shop.name}: ${created} criados, ${updated} atualizados, ${vehiclesToDeactivate.length} desativados.`,
      );

      return result;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Erro desconhecido ao sincronizar estoque.';

      shop.inventoryLastSyncStatus = 'error';
      shop.inventoryLastSyncError = message;
      await this.shopsRepository.save(shop);

      throw error;
    }
  }

  private registerShopCron(shop: ShopEntity) {
    const cronExpression = shop.inventorySyncCron ?? KAFKA_MULTIMARCAS_DEFAULT_CRON;
    const jobName = `inventory-sync:${shop.id}`;

    const job = new CronJob(cronExpression, async () => {
      try {
        await this.syncShopInventory(shop.id);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Erro desconhecido no cron de estoque.';
        this.logger.error(`Falha no cron de sincronizaÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¾Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¾Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â£o da loja ${shop.name}: ${message}`);
      }
    });

    this.schedulerRegistry.addCronJob(jobName, job);
    job.start();
    this.logger.log(`Cron de estoque registrado para ${shop.name}: ${cronExpression}`);
  }

  private async fetchFeed(feedUrl: string): Promise<ExternalInventoryFeed> {
    const response = await fetch(feedUrl, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Falha ao buscar feed ${feedUrl}: ${response.status}`);
    }

    const payload = (await response.json()) as ExternalInventoryFeed;
    if (!payload?.veiculos || !Array.isArray(payload.veiculos)) {
      throw new Error('Feed de estoque invÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¾Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡lido.');
    }

    return payload;
  }

  private applyExternalVehicle(
    entity: VehicleEntity,
    shop: ShopEntity,
    feed: ExternalInventoryFeed,
    record: ExternalVehicleRecord,
    now: Date,
  ) {
    const photoCollections = this.buildPhotoCollections(feed, record, KAFKA_MULTIMARCAS_SOURCE_NAME);

    entity.shopId = shop.id;
    entity.brand = this.safeString(record.marca, 80);
    entity.model = this.safeString(record.modelo, 80);
    entity.version = this.nullableString(record.versao ?? record.veiculo, 120);
    entity.year = this.parseIntSafe(record.ano, now.getFullYear());
    entity.plate = this.nullableString(record.placa?.toUpperCase(), 20);
    entity.color = this.nullableString(record.cor, 40);
    entity.transmission = this.mapTransmission(record.cambio);
    entity.fuelType = this.nullableString(record.combustivel, 40);
    entity.condition = this.nullableString(record.estado, 40);
    entity.categoryType = this.nullableString(record.tipo_categoria, 40);
    entity.mileage = this.parseNullableInt(record.km);
    entity.price = this.resolvePrice(record);
    entity.city = this.nullableString(record.cidade ?? shop.city ?? undefined, 120);
    entity.state = this.nullableString(record.uf ?? shop.state ?? undefined, 80);
    entity.description = this.nullableString(record.obs_site || record.obs);
    entity.ownersCount = null;
    entity.photoUrls = photoCollections.originalPhotoUrls;
    entity.originalPhotoUrls = photoCollections.originalPhotoUrls;
    entity.thumbnailPhotoUrls = photoCollections.thumbnailPhotoUrls;
    entity.isActive = true;
    entity.isSold = false;
    entity.isOnOffer = this.parseNumber(record.valor_oferta) > 0 || record.em_oferta === 'sim';
    entity.isHighlighted = record.destaqueSite === '1';
    entity.hasAccident = false;
    entity.hasAuction = false;
    entity.isFirstOwner = false;
    entity.externalVehicleId = String(record.cod_veiculo);
    entity.externalImportId = this.nullableString(record.cod_importacao);
    entity.integrationSource = KAFKA_MULTIMARCAS_SOURCE_NAME;
    entity.externalRaw = record as unknown as Record<string, unknown>;
    entity.sourceUpdatedAt = this.parseNullableDate(record.data_cad);
    entity.sourceLastSeenAt = now;
  }

  private buildPhotoCollections(
    feed: ExternalInventoryFeed,
    record: ExternalVehicleRecord,
    integrationSource: string,
  ) {
    const strategy = this.resolveImageStrategy(integrationSource);
    const originalPhotoUrls = (record.fotos ?? []).map((filename) =>
      strategy.buildOriginalUrl(feed, record, this.normalizePhotoFilename(integrationSource, filename)),
    );
    const thumbnailPhotoUrls = (record.fotos ?? []).map((filename) =>
      strategy.buildThumbnailUrl(feed, record, this.normalizePhotoFilename(integrationSource, filename)),
    );

    return {
      originalPhotoUrls,
      thumbnailPhotoUrls,
    };
  }

  private resolveImageStrategy(integrationSource: string) {
    if (integrationSource === KAFKA_MULTIMARCAS_SOURCE_NAME) {
      return {
        buildOriginalUrl: (feed: ExternalInventoryFeed, _record: ExternalVehicleRecord, filename: string) =>
          `${KAFKA_MULTIMARCAS_IMAGE_BUCKET_BASE_URL}/${feed.cod_loja}/${filename}`,
        buildThumbnailUrl: (feed: ExternalInventoryFeed, _record: ExternalVehicleRecord, filename: string) =>
          `${KAFKA_MULTIMARCAS_IMAGE_BUCKET_BASE_URL}/${feed.cod_loja}/${filename}`,
      };
    }

    return {
      buildOriginalUrl: (feed: ExternalInventoryFeed, _record: ExternalVehicleRecord, filename: string) =>
        `${KAFKA_MULTIMARCAS_IMAGE_BUCKET_BASE_URL}/${feed.cod_loja}/${filename}`,
      buildThumbnailUrl: (feed: ExternalInventoryFeed, _record: ExternalVehicleRecord, filename: string) =>
        `${KAFKA_MULTIMARCAS_IMAGE_BUCKET_BASE_URL}/${feed.cod_loja}/${filename}`,
    };
  }

  private normalizePhotoFilename(integrationSource: string, filename: string) {
    if (integrationSource !== KAFKA_MULTIMARCAS_SOURCE_NAME) {
      return filename;
    }

    const trimmed = filename.trim();
    if (!trimmed) {
      return trimmed;
    }

    if (/-\d{3}\.[a-z0-9]+$/i.test(trimmed)) {
      return trimmed;
    }

    const extensionMatch = trimmed.match(/(\.[a-z0-9]+)$/i);
    if (!extensionMatch) {
      return trimmed + '-004';
    }

    const extension = extensionMatch[1];
    return trimmed.slice(0, -extension.length) + '-004' + extension;
  }

  private resolvePrice(record: ExternalVehicleRecord) {
    const offer = this.parseNumber(record.valor_oferta);
    if (offer > 0) {
      return offer;
    }
    return this.parseNumber(record.valor);
  }

  private parseNumber(value?: string | number | null) {
    if (value === undefined || value === null || value === '') {
      return 0;
    }

    const normalized =
      typeof value === 'number' ? value : Number(String(value).replace(',', '.'));
    return Number.isFinite(normalized) ? normalized : 0;
  }

  private parseIntSafe(value: string | number | undefined, fallback: number) {
    const normalized = Number.parseInt(String(value ?? ''), 10);
    return Number.isFinite(normalized) ? normalized : fallback;
  }

  private parseNullableInt(value?: string | number | null) {
    if (value === undefined || value === null || value === '') {
      return null;
    }

    const normalized = Number.parseInt(String(value), 10);
    return Number.isFinite(normalized) ? normalized : null;
  }

  private parseNullableDate(value?: string | null) {
    if (!value) return null;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  private safeString(value?: string | null, maxLength?: number) {
    const normalized = (value ?? '').trim();
    return maxLength ? normalized.slice(0, maxLength) : normalized;
  }

  private nullableString(value?: string | null, maxLength?: number) {
    const normalized = value?.trim();
    if (!normalized) return null;
    return maxLength ? normalized.slice(0, maxLength) : normalized;
  }

  private mapTransmission(value?: string | null) {
    if (!value) return null;
    const normalized = value.toLowerCase();
    if (normalized.includes('auto')) return 'Automatico';
    if (normalized.includes('manual')) return 'Manual';
    return this.nullableString(value, 40);
  }
}
