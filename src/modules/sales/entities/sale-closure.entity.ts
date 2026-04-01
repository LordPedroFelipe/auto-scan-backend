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
import { LeadEntity } from '../../leads/entities/lead.entity';
import { ShopEntity } from '../../shops/entities/shop.entity';
import { TestDriveEntity } from '../../test-drives/entities/test-drive.entity';
import { UserEntity } from '../../users/entities/user.entity';
import { VehicleEntity } from '../../vehicles/entities/vehicle.entity';

export enum SaleOutcomeType {
  Sale = 'Sale',
  NoSale = 'NoSale',
}

export enum SaleGiftType {
  None = 'None',
  FuelTank = 'FuelTank',
  Documentation = 'Documentation',
  Warranty = 'Warranty',
  AccessoryKit = 'AccessoryKit',
  ProtectionFilm = 'ProtectionFilm',
  InsuranceBonus = 'InsuranceBonus',
  ServicePackage = 'ServicePackage',
  Other = 'Other',
}

export enum NoSaleReason {
  Price = 'Price',
  CreditDenied = 'CreditDenied',
  ChoseCompetitor = 'ChoseCompetitor',
  NoContact = 'NoContact',
  StockUnavailable = 'StockUnavailable',
  PostponedDecision = 'PostponedDecision',
  VehicleMismatch = 'VehicleMismatch',
  Other = 'Other',
  NotInformed = 'NotInformed',
}

export enum PaymentMethod {
  Cash = 'Cash',
  Financing = 'Financing',
  Consorcio = 'Consorcio',
  Pix = 'Pix',
  BankTransfer = 'BankTransfer',
  CreditCard = 'CreditCard',
  TradeIn = 'TradeIn',
  Other = 'Other',
}

@Index('IDX_sale_closure_shop_closed_at', ['shopId', 'closedAt'])
@Index('UQ_sale_closure_lead', ['leadId'], { unique: true })
@Entity('sale_closures')
export class SaleClosureEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  shopId!: string;

  @Column({ type: 'uuid' })
  leadId!: string;

  @Column({ type: 'uuid', nullable: true })
  vehicleId!: string | null;

  @Column({ type: 'uuid', nullable: true })
  sellerId!: string | null;

  @Column({ type: 'uuid', nullable: true })
  testDriveId!: string | null;

  @ManyToOne(() => ShopEntity, { nullable: false })
  @JoinColumn({ name: 'shopId' })
  shop!: ShopEntity;

  @ManyToOne(() => LeadEntity, { nullable: false })
  @JoinColumn({ name: 'leadId' })
  lead!: LeadEntity;

  @ManyToOne(() => VehicleEntity, { nullable: true })
  @JoinColumn({ name: 'vehicleId' })
  vehicle?: VehicleEntity | null;

  @ManyToOne(() => UserEntity, { nullable: true })
  @JoinColumn({ name: 'sellerId' })
  seller?: UserEntity | null;

  @ManyToOne(() => TestDriveEntity, { nullable: true })
  @JoinColumn({ name: 'testDriveId' })
  testDrive?: TestDriveEntity | null;

  @Column({ type: 'enum', enum: SaleOutcomeType })
  outcomeType!: SaleOutcomeType;

  @Column({ type: 'enum', enum: PaymentMethod, nullable: true })
  paymentMethod!: PaymentMethod | null;

  @Column({ type: 'enum', enum: SaleGiftType, default: SaleGiftType.None })
  giftType!: SaleGiftType;

  @Column({ type: 'enum', enum: NoSaleReason, nullable: true })
  noSaleReason!: NoSaleReason | null;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  listPrice!: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  salePrice!: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  discountValue!: number;

  @Column({ type: 'numeric', precision: 5, scale: 2, default: 0 })
  discountPercent!: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true })
  entryValue!: number | null;

  @Column({ type: 'int', nullable: true })
  installments!: number | null;

  @Column({ type: 'boolean', default: false })
  tradeInAccepted!: boolean;

  @Column({ type: 'text', nullable: true })
  tradeInDescription!: string | null;

  @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true })
  commissionValue!: number | null;

  @Column({ type: 'varchar', nullable: true, length: 160 })
  competitorName!: string | null;

  @Column({ type: 'varchar', nullable: true, length: 200 })
  accessoryDescription!: string | null;

  @Column({ type: 'timestamptz' })
  closedAt!: Date;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @Column({ type: 'jsonb', default: () => "'{}'::jsonb" })
  metadata!: Record<string, unknown>;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
