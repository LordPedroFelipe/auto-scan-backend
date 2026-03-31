import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export type InventorySyncTriggerType = 'manual' | 'cron' | 'startup' | 'bulk';
export type InventorySyncStatus = 'success' | 'error';

@Entity('inventory_sync_logs')
export class InventorySyncLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  shopId!: string;

  @Column({ type: 'varchar', length: 160 })
  shopName!: string;

  @Column({ type: 'varchar', nullable: true, length: 500 })
  inventoryFeedUrl!: string | null;

  @Column({ type: 'varchar', nullable: true, length: 80 })
  inventorySourceCode!: string | null;

  @Column({ type: 'varchar', nullable: true, length: 120 })
  inventorySourceName!: string | null;

  @Column({ type: 'varchar', nullable: true, length: 120 })
  inventorySyncCron!: string | null;

  @Column({ type: 'boolean', default: false })
  inventorySyncEnabled!: boolean;

  @Column({ type: 'varchar', length: 20 })
  triggerType!: InventorySyncTriggerType;

  @Column({ type: 'varchar', length: 20 })
  status!: InventorySyncStatus;

  @Column({ type: 'int', default: 0 })
  imported!: number;

  @Column({ type: 'int', default: 0 })
  created!: number;

  @Column({ type: 'int', default: 0 })
  updated!: number;

  @Column({ type: 'int', default: 0 })
  deactivated!: number;

  @Column({ type: 'int', default: 0 })
  totalInFeed!: number;

  @Column({ type: 'int', default: 0 })
  activeIntegratedVehicles!: number;

  @Column({ type: 'int', default: 0 })
  durationMs!: number;

  @Column({ type: 'timestamptz' })
  startedAt!: Date;

  @Column({ type: 'timestamptz' })
  finishedAt!: Date;

  @Column({ type: 'text', nullable: true })
  errorMessage!: string | null;

  @Column({ type: 'jsonb', default: () => "'{}'::jsonb" })
  metadata!: Record<string, unknown>;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
