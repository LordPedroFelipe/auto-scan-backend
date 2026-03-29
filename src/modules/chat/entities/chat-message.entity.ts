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

export type ChatMessageAuthor = 'IA' | 'Cliente' | 'Sistema';

@Index('IDX_chat_message_session_created', ['sessionId', 'createdAt'])
@Entity('chat_messages')
export class ChatMessageEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  sessionId!: string;

  @ManyToOne(() => ChatSessionEntity, (session) => session.messages, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sessionId' })
  session!: ChatSessionEntity;

  @Column({ type: 'varchar', length: 20 })
  author!: ChatMessageAuthor;

  @Column({ type: 'text' })
  text!: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata!: Record<string, unknown> | null;

  @CreateDateColumn()
  createdAt!: Date;
}
