import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { SalesGoalType } from '../entities/sales-goal.entity';

export class CreateSalesGoalDto {
  @ApiProperty({ enum: SalesGoalType, example: SalesGoalType.ShopMonthly })
  @IsEnum(SalesGoalType)
  type!: SalesGoalType;

  @ApiProperty({ example: 2024 })
  @IsNumber()
  @Min(2020)
  year!: number;

  @ApiProperty({ example: 3, minimum: 1, maximum: 12 })
  @IsNumber()
  @Min(1)
  month!: number;

  @ApiProperty({ example: 500000.00 })
  @IsNumber()
  @Min(0)
  targetValue!: number;

  @ApiPropertyOptional({ example: 'Meta mensal da loja' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  sellerId?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  shopId?: string;

  @ApiPropertyOptional({ example: 'Campanha de março' })
  @IsOptional()
  @IsString()
  campaignName?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  campaignId?: string;
}

export class UpdateSalesGoalDto {
  @ApiPropertyOptional({ example: 600000.00 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  targetValue?: number;

  @ApiPropertyOptional({ example: 'Meta atualizada' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ type: 'boolean' })
  @IsOptional()
  isActive?: boolean;
}

export class SalesGoalsQueryDto {
  @ApiPropertyOptional({ example: '2024' })
  @IsOptional()
  @IsString()
  year?: string;

  @ApiPropertyOptional({ example: '3' })
  @IsOptional()
  @IsString()
  month?: string;

  @ApiPropertyOptional({ enum: SalesGoalType })
  @IsOptional()
  @IsEnum(SalesGoalType)
  type?: SalesGoalType;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  sellerId?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  shopId?: string;

  @ApiPropertyOptional({ type: 'boolean' })
  @IsOptional()
  isActive?: boolean;
}