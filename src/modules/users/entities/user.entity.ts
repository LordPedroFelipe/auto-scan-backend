import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ShopEntity } from '../../shops/entities/shop.entity';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 120 })
  userName!: string;

  @Column({ unique: true, length: 160 })
  email!: string;

  @Column({ type: 'varchar', nullable: true, length: 40 })
  phoneNumber!: string | null;

  @Column({ type: 'varchar', select: false, nullable: true })
  passwordHash?: string;

  @Column({ default: false })
  emailConfirmed!: boolean;

  @Column({ default: false })
  lockoutEnabled!: boolean;

  @Column({ default: 0 })
  accessFailedCount!: number;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ type: 'varchar', nullable: true, length: 128 })
  passwordResetTokenHash!: string | null;

  @Column({ type: 'timestamp', nullable: true })
  passwordResetExpiresAt!: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  welcomeEmailSentAt!: Date | null;

  @Column('simple-array', { default: 'Seller' })
  roles!: string[];

  @Column('simple-array', { default: '' })
  claims!: string[];

  @Column({ type: 'uuid', nullable: true })
  shopId!: string | null;

  @ManyToOne(() => ShopEntity, (shop) => shop.users, { nullable: true })
  @JoinColumn({ name: 'shopId' })
  shop?: ShopEntity | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @BeforeInsert()
  @BeforeUpdate()
  normalizeEmail() {
    this.email = this.email.toLowerCase();
  }
}
