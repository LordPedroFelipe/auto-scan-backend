import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export type SubscriptionType = 'Monthly' | 'Yearly';

@Entity('subscriptions')
export class SubscriptionEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 120 })
  name!: string;

  @Column({ type: 'varchar', length: 120, nullable: true })
  slug!: string | null;

  @Column({ type: 'varchar', length: 60, nullable: true })
  code!: string | null;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  price!: number;

  @Column({ type: 'int', default: 30 })
  durationInDays!: number;

  @Column({ type: 'int', default: 0 })
  qrCodeLimit!: number;

  @Column({ type: 'varchar', length: 20, default: 'Monthly' })
  type!: SubscriptionType;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  benefits!: string[];

  @Column({ type: 'varchar', length: 120, nullable: true })
  marketingBadge!: string | null;

  @Column({ type: 'int', default: 0 })
  displayOrder!: number;

  @Column({ default: false })
  isFeatured!: boolean;

  @Column({ default: false })
  isPromotional!: boolean;

  @Column({ default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
