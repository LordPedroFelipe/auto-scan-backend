import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { LeadNoteType } from '../entities/lead-note.entity';

export class CreateLeadNoteDto {
  @IsUUID()
  leadId!: string;

  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsString()
  comment!: string;

  @IsEnum(LeadNoteType)
  type!: LeadNoteType;
}
