import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsIn, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateSubscriptionDto {
  @ApiProperty({ example: 'Plano Premium' })
  @IsString()
  name!: string;

  @ApiPropertyOptional({ example: 'Plano com IA, estoque e relatorios.' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'plano-start' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({ example: 'START_399' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiProperty({ example: 799, minimum: 0 })
  @IsNumber()
  @Min(0)
  price!: number;

  @ApiProperty({ example: 30, minimum: 1 })
  @IsNumber()
  @Min(1)
  durationInDays!: number;

  @ApiProperty({ example: 500, minimum: 0 })
  @IsNumber()
  @Min(0)
  qrCodeLimit!: number;

  @ApiProperty({ enum: ['Monthly', 'Yearly'], example: 'Monthly' })
  @IsString()
  @IsIn(['Monthly', 'Yearly'])
  type!: 'Monthly' | 'Yearly';

  @ApiPropertyOptional({
    example: ['Cadastro de até 20 veículos', 'IA comercial inicial', 'Agendamento de test drive'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  benefits?: string[];

  @ApiPropertyOptional({ example: 'Mais vendido' })
  @IsOptional()
  @IsString()
  marketingBadge?: string;

  @ApiPropertyOptional({ example: 10, minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  displayOrder?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isPromotional?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
