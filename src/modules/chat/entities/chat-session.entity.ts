import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { LeadEntity } from '../../leads/entities/lead.entity';
import { ShopEntity } from '../../shops/entities/shop.entity';
import { VehicleEntity } from '../../vehicles/entities/vehicle.entity';
import { ChatMessageEntity } from './chat-message.entity';
import { ChatTelemetryEventEntity } from './chat-telemetry-event.entity';

@Index('IDX_chat_session_session_key', ['sessionKey'], { unique: true })
@Entity('chat_sessions')
export class ChatSessionEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 120 })
  sessionKey!: string;

  @Column({ type: 'uuid', nullable: true })
  shopId!: string | null;

  @Column({ type: 'uuid', nullable: true })
  vehicleId!: string | null;

  @Column({ type: 'uuid', nullable: true })
  leadId!: string | null;

  @ManyToOne(() => ShopEntity, { nullable: true })
  @JoinColumn({ name: 'shopId' })
  shop?: ShopEntity | null;

  @ManyToOne(() => VehicleEntity, { nullable: true })
  @JoinColumn({ name: 'vehicleId' })
  vehicle?: VehicleEntity | null;

  @ManyToOne(() => LeadEntity, { nullable: true })
  @JoinColumn({ name: 'leadId' })
  lead?: LeadEntity | null;

  @Column({ type: 'jsonb', default: () => "'{}'::jsonb" })
  customerProfile!: Record<string, unknown>;

  @Column({ type: 'text', nullable: true })
  summary!: string | null;

  @Column({ type: 'text', array: true, default: '{}' })
  lastRecommendedVehicleIds!: string[];

  @Column({ type: 'text', array: true, default: '{}' })
  keywords!: string[];

  @Column({ type: 'int', default: 0 })
  messagesCount!: number;

  @Column({ type: 'int', default: 0 })
  toolCallsCount!: number;

  @Column({ type: 'int', default: 0 })
  handoffsCount!: number;

  @Column({ type: 'timestamptz', nullable: true })
  lastCustomerMessageAt!: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  lastAssistantMessageAt!: Date | null;

  @OneToMany(() => ChatMessageEntity, (message) => message.session)
  messages?: ChatMessageEntity[];

  @OneToMany(() => ChatTelemetryEventEntity, (event) => event.session)
  telemetryEvents?: ChatTelemetryEventEntity[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
