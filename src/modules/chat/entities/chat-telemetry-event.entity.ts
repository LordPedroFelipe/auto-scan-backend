import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ChatSessionEntity } from './chat-session.entity';

export type ChatTelemetryLevel = 'info' | 'warning' | 'error';

@Index('IDX_chat_telemetry_session_created', ['sessionId', 'createdAt'])
@Entity('chat_telemetry_events')
export class ChatTelemetryEventEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  sessionId!: string;

  @ManyToOne(() => ChatSessionEntity, (session) => session.telemetryEvents, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sessionId' })
  session!: ChatSessionEntity;

  @Column({ type: 'varchar', length: 60 })
  type!: string;

  @Column({ type: 'varchar', length: 20, default: 'info' })
  level!: ChatTelemetryLevel;

  @Column({ type: 'text' })
  message!: string;

  @Column({ type: 'jsonb', nullable: true })
  payload!: Record<string, unknown> | null;

  @CreateDateColumn()
  createdAt!: Date;
}
