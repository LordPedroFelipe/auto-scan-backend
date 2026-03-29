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
import { UserEntity } from '../../users/entities/user.entity';

export enum LeadNoteType {
  Nota = 'Nota',
  Aviso = 'Aviso',
  Contato = 'Contato',
}

@Entity('lead_notes')
export class LeadNoteEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  leadId!: string;

  @Column({ type: 'uuid', nullable: true })
  userId!: string | null;

  @ManyToOne(() => LeadEntity, { nullable: false })
  @JoinColumn({ name: 'leadId' })
  lead!: LeadEntity;

  @ManyToOne(() => UserEntity, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user?: UserEntity | null;

  @Column({ type: 'text' })
  comment!: string;

  @Column({
    type: 'enum',
    enum: LeadNoteType,
    default: LeadNoteType.Nota,
  })
  type!: LeadNoteType;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
