import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ShopEntity } from '../../shops/entities/shop.entity';
import { UserEntity } from '../../users/entities/user.entity';
import { VehicleEntity } from '../../vehicles/entities/vehicle.entity';

export enum LeadStatus {
  New = 'New',
  Contacted = 'Contacted',
  InProgress = 'InProgress',
  Qualified = 'Qualified',
  Negotiating = 'Negotiating',
  Won = 'Won',
  Lost = 'Lost',
  NoResponse = 'NoResponse',
}

@Entity('leads')
export class LeadEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', nullable: true })
  shopId!: string | null;

  @Column({ type: 'uuid', nullable: true })
  vehicleId!: string | null;

  @Column({ type: 'uuid', nullable: true })
  sellerId!: string | null;

  @ManyToOne(() => ShopEntity, { nullable: true })
  @JoinColumn({ name: 'shopId' })
  shop?: ShopEntity | null;

  @ManyToOne(() => VehicleEntity, { nullable: true })
  @JoinColumn({ name: 'vehicleId' })
  vehicle?: VehicleEntity | null;

  @ManyToOne(() => UserEntity, { nullable: true })
  @JoinColumn({ name: 'sellerId' })
  seller?: UserEntity | null;

  @Column({ length: 120 })
  name!: string;

  @Column({ type: 'varchar', nullable: true, length: 160 })
  email!: string | null;

  @Column({ type: 'varchar', nullable: true, length: 40 })
  phone!: string | null;

  @Column({ type: 'varchar', nullable: true, length: 120 })
  city!: string | null;

  @Column({ type: 'varchar', nullable: true, length: 120 })
  origin!: string | null;

  @Column({
    type: 'enum',
    enum: LeadStatus,
    default: LeadStatus.New,
  })
  status!: LeadStatus;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @Column({ default: false })
  hasBeenContacted!: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  contactDate!: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  lastContactDate!: Date | null;

  @Column({ default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
