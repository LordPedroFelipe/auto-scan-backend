import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';
import { VehicleEntity } from '../../vehicles/entities/vehicle.entity';

@Entity('shops')
export class ShopEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 160 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'varchar', nullable: true, length: 18 })
  cnpj!: string | null;

  @Column({ type: 'varchar', nullable: true, length: 160 })
  email!: string | null;

  @Column({ type: 'varchar', nullable: true, length: 40 })
  phoneNumber!: string | null;

  @Column({ type: 'varchar', nullable: true, length: 255 })
  addressLine!: string | null;

  @Column({ type: 'varchar', nullable: true, length: 100 })
  city!: string | null;

  @Column({ type: 'varchar', nullable: true, length: 80 })
  state!: string | null;

  @Column({ type: 'varchar', nullable: true, length: 20 })
  zipCode!: string | null;

  @Column({ type: 'int', default: 10 })
  qrCodeLimit!: number;

  @Column({ type: 'varchar', nullable: true, length: 500 })
  inventoryFeedUrl!: string | null;

  @Column({ type: 'varchar', nullable: true, length: 80 })
  inventorySourceCode!: string | null;

  @Column({ type: 'varchar', nullable: true, length: 120 })
  inventorySourceName!: string | null;

  @Column({ type: 'varchar', nullable: true, length: 500 })
  inventoryImageBucketBaseUrl!: string | null;

  @Column({ type: 'uuid', nullable: true })
  inventoryMasterUserId!: string | null;

  @Column({ type: 'uuid', nullable: true })
  inventorySellerUserId!: string | null;

  @Column({ type: 'varchar', nullable: true, length: 120 })
  inventorySyncCron!: string | null;

  @Column({ default: false })
  inventorySyncEnabled!: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  inventoryLastSyncAt!: Date | null;

  @Column({ type: 'varchar', nullable: true, length: 40 })
  inventoryLastSyncStatus!: string | null;

  @Column({ type: 'text', nullable: true })
  inventoryLastSyncError!: string | null;

  @Column({ type: 'jsonb', default: () => "'{}'::jsonb" })
  settingsPreferences!: Record<string, unknown>;

  @Column({ type: 'jsonb', default: () => "'[]'::jsonb" })
  notificationPreferences!: Array<Record<string, unknown>>;

  @Column({ type: 'varchar', nullable: true, length: 40 })
  billingCustomerProvider!: string | null;

  @Column({ type: 'varchar', nullable: true, length: 120 })
  billingCustomerExternalId!: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  billingCustomerSyncedAt!: Date | null;

  @Column({ type: 'uuid', nullable: true })
  ownerId!: string | null;

  @ManyToOne(() => UserEntity, { nullable: true })
  @JoinColumn({ name: 'ownerId' })
  owner?: UserEntity | null;

  @OneToMany(() => UserEntity, (user) => user.shop)
  users?: UserEntity[];

  @OneToMany(() => VehicleEntity, (vehicle) => vehicle.shop)
  vehicles?: VehicleEntity[];

  @Column({ default: true })
  isActive!: boolean;

  @Column({ default: false })
  isDeleted!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
