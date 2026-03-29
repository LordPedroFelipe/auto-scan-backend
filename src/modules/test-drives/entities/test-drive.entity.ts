import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { LeadEntity } from '../../leads/entities/lead.entity';
import { ShopEntity } from '../../shops/entities/shop.entity';
import { VehicleEntity } from '../../vehicles/entities/vehicle.entity';

export enum TestDriveStatus {
  Pending = 'Pending',
  Confirmed = 'Confirmed',
  Canceled = 'Canceled',
  Completed = 'Completed',
}

@Entity('test_drives')
export class TestDriveEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  vehicleId!: string;

  @Column({ type: 'uuid', nullable: true })
  shopId!: string | null;

  @Column({ type: 'uuid', nullable: true })
  leadId!: string | null;

  @ManyToOne(() => VehicleEntity, { nullable: false })
  @JoinColumn({ name: 'vehicleId' })
  vehicle!: VehicleEntity;

  @ManyToOne(() => ShopEntity, { nullable: true })
  @JoinColumn({ name: 'shopId' })
  shop?: ShopEntity | null;

  @ManyToOne(() => LeadEntity, { nullable: true })
  @JoinColumn({ name: 'leadId' })
  lead?: LeadEntity | null;

  @Column({ length: 120 })
  customerName!: string;

  @Column({ type: 'varchar', nullable: true, length: 160 })
  customerEmail!: string | null;

  @Column({ type: 'varchar', nullable: true, length: 40 })
  customerPhone!: string | null;

  @Column({ type: 'timestamptz' })
  preferredDate!: Date;

  @Column({ type: 'varchar', nullable: true, length: 20 })
  preferredTime!: string | null;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @Column({
    type: 'enum',
    enum: TestDriveStatus,
    default: TestDriveStatus.Pending,
  })
  status!: TestDriveStatus;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
