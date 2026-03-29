import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { LeadNoteType } from '../entities/lead-note.entity';

export class CreateLeadNoteDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  leadId!: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiProperty({ example: 'Cliente pediu retorno apos consultar financiamento.' })
  @IsString()
  comment!: string;

  @ApiProperty({ enum: LeadNoteType, example: LeadNoteType.Nota })
  @IsEnum(LeadNoteType)
  type!: LeadNoteType;
}
