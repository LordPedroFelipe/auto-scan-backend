import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ShopEntity } from '../../shops/entities/shop.entity';
import { SubscriptionEntity } from './subscription.entity';
import { UserEntity } from '../../users/entities/user.entity';

@Entity('subscription_payments')
export class SubscriptionPaymentEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  subscriptionId!: string;

  @ManyToOne(() => SubscriptionEntity, { nullable: false })
  @JoinColumn({ name: 'subscriptionId' })
  subscription?: SubscriptionEntity;

  @Column({ type: 'uuid', nullable: true })
  shopId!: string | null;

  @ManyToOne(() => ShopEntity, { nullable: true })
  @JoinColumn({ name: 'shopId' })
  shop?: ShopEntity | null;

  @Column({ type: 'uuid', nullable: true })
  userId!: string | null;

  @ManyToOne(() => UserEntity, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user?: UserEntity | null;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  amount!: number;

  @Column({ type: 'timestamp' })
  startDate!: Date;

  @Column({ type: 'timestamp' })
  endDate!: Date;

  @Column({ type: 'varchar', length: 40, default: 'pending' })
  status!: string;

  @Column({ type: 'text', nullable: true })
  invoiceUrl!: string | null;

  @CreateDateColumn()
  createdAt!: Date;
}
