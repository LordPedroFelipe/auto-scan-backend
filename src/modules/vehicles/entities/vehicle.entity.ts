import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ShopEntity } from '../../shops/entities/shop.entity';

@Index('IDX_vehicle_shop_external', ['shopId', 'externalVehicleId'], {
  unique: true,
  where: '"externalVehicleId" IS NOT NULL',
})
@Entity('vehicles')
export class VehicleEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  shopId!: string;

  @ManyToOne(() => ShopEntity, (shop) => shop.vehicles, { nullable: false })
  @JoinColumn({ name: 'shopId' })
  shop!: ShopEntity;

  @Column({ length: 80 })
  brand!: string;

  @Column({ length: 80 })
  model!: string;

  @Column({ type: 'varchar', nullable: true, length: 120 })
  version!: string | null;

  @Column('int')
  year!: number;

  @Column({ type: 'varchar', nullable: true, length: 20 })
  plate!: string | null;

  @Column({ type: 'varchar', nullable: true, length: 40 })
  color!: string | null;

  @Column({ type: 'varchar', nullable: true, length: 40 })
  transmission!: string | null;

  @Column({ type: 'varchar', nullable: true, length: 40 })
  fuelType!: string | null;

  @Column({ type: 'varchar', nullable: true, length: 40 })
  condition!: string | null;

  @Column({ type: 'varchar', nullable: true, length: 40 })
  categoryType!: string | null;

  @Column({ nullable: true, type: 'int' })
  mileage!: number | null;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  price!: number;

  @Column({ type: 'varchar', nullable: true, length: 120 })
  city!: string | null;

  @Column({ type: 'varchar', nullable: true, length: 80 })
  state!: string | null;

  @Column({ nullable: true, type: 'text' })
  description!: string | null;

  @Column({ nullable: true, type: 'int' })
  ownersCount!: number | null;

  @Column('text', { array: true, default: '{}' })
  photoUrls!: string[];

  @Column('text', { array: true, default: '{}' })
  originalPhotoUrls!: string[];

  @Column('text', { array: true, default: '{}' })
  thumbnailPhotoUrls!: string[];

  @Column({ default: true })
  isActive!: boolean;

  @Column({ type: 'varchar', nullable: true, length: 80 })
  externalVehicleId!: string | null;

  @Column({ type: 'varchar', nullable: true, length: 80 })
  externalImportId!: string | null;

  @Column({ type: 'varchar', nullable: true, length: 60 })
  integrationSource!: string | null;

  @Column({ type: 'jsonb', nullable: true })
  externalRaw!: Record<string, unknown> | null;

  @Column({ type: 'timestamptz', nullable: true })
  sourceUpdatedAt!: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  sourceLastSeenAt!: Date | null;

  @Column({ default: false })
  hasAuction!: boolean;

  @Column({ default: false })
  hasAccident!: boolean;

  @Column({ default: false })
  isFirstOwner!: boolean;

  @Column({ default: false })
  isConsigned!: boolean;

  @Column({ default: false })
  isOnOffer!: boolean;

  @Column({ default: false })
  isHighlighted!: boolean;

  @Column({ default: false })
  isSold!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
