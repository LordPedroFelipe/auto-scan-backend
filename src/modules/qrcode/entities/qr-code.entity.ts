import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('qr_codes')
export class QrCodeEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  shopId!: string;

  @Column({ length: 40 })
  code!: string;

  @Column({ length: 255 })
  link!: string;

  @Column({ type: 'varchar', nullable: true, length: 100 })
  redirectId!: string | null;

  @Column({ type: 'varchar', nullable: true, length: 50 })
  redirectType!: string | null;

  @Column({ type: 'varchar', nullable: true, length: 20 })
  vehiclePlate!: string | null;

  @CreateDateColumn()
  createdAt!: Date;
}
