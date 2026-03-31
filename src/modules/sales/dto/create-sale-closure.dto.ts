import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { NoSaleReason, PaymentMethod, SaleGiftType, SaleOutcomeType } from '../entities/sale-closure.entity';

export class CreateSaleClosureDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  leadId!: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  shopId?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  vehicleId?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  sellerId?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  testDriveId?: string;

  @ApiProperty({ enum: SaleOutcomeType })
  @IsEnum(SaleOutcomeType)
  outcomeType!: SaleOutcomeType;

  @ApiPropertyOptional({ enum: PaymentMethod })
  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @ApiPropertyOptional({ enum: SaleGiftType, default: SaleGiftType.None })
  @IsOptional()
  @IsEnum(SaleGiftType)
  giftType?: SaleGiftType;

  @ApiPropertyOptional({ enum: NoSaleReason })
  @IsOptional()
  @IsEnum(NoSaleReason)
  noSaleReason?: NoSaleReason;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  listPrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  salePrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  discountValue?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  discountPercent?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  entryValue?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  installments?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  tradeInAccepted?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  tradeInDescription?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  commissionValue?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  competitorName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  accessoryDescription?: string;

  @ApiProperty()
  @IsDateString()
  closedAt!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
