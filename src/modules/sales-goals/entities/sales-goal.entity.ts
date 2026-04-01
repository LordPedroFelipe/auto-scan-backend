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
import { UserEntity } from '../../users/entities/user.entity';

export enum SalesGoalType {
  ShopMonthly = 'ShopMonthly',
  SellerMonthly = 'SellerMonthly',
  Campaign = 'Campaign',
}

@Index('IDX_sales_goal_shop_year_month', ['shopId', 'year', 'month'])
@Index('IDX_sales_goal_seller_year_month', ['sellerId', 'year', 'month'])
@Entity('sales_goals')
export class SalesGoalEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  shopId!: string;

  @Column({ type: 'uuid', nullable: true })
  sellerId!: string | null;

  @Column({ type: 'uuid', nullable: true })
  campaignId!: string | null;

  @ManyToOne(() => ShopEntity, { nullable: false })
  @JoinColumn({ name: 'shopId' })
  shop!: ShopEntity;

  @ManyToOne(() => UserEntity, { nullable: true })
  @JoinColumn({ name: 'sellerId' })
  seller?: UserEntity | null;

  @Column({ type: 'enum', enum: SalesGoalType })
  type!: SalesGoalType;

  @Column({ type: 'int' })
  year!: number;

  @Column({ type: 'int' })
  month!: number;

  @Column({ type: 'varchar', nullable: true, length: 100 })
  campaignName!: string | null;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  targetValue!: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  currentValue!: number;

  @Column({ type: 'date', nullable: true })
  startDate!: Date | null;

  @Column({ type: 'date', nullable: true })
  endDate!: Date | null;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'jsonb', default: () => "'{}'::jsonb" })
  metadata!: Record<string, unknown>;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}