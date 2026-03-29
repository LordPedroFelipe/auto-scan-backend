import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateVehicleDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  shopId!: string;

  @ApiProperty({ example: 'Toyota' })
  @IsString()
  brand!: string;

  @ApiProperty({ example: 'Corolla' })
  @IsString()
  model!: string;

  @ApiPropertyOptional({ example: 'XEi 2.0 CVT' })
  @IsOptional()
  @IsString()
  version?: string;

  @ApiProperty({ example: 2023, minimum: 1900 })
  @IsNumber()
  @Min(1900)
  year!: number;

  @IsOptional()
  @IsString()
  plate?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  transmission?: string;

  @IsOptional()
  @IsString()
  fuelType?: string;

  @IsOptional()
  @IsString()
  condition?: string;

  @IsOptional()
  @IsString()
  categoryType?: string;

  @IsOptional()
  @IsNumber()
  mileage?: number;

  @ApiProperty({ example: 119900, minimum: 0 })
  @IsNumber()
  @Min(0)
  price!: number;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  ownersCount?: number;

  @ApiPropertyOptional({ example: ['https://cdn.site.com/foto-1.webp'] })
  @IsOptional()
  @IsArray()
  photoUrls?: string[];

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  hasAuction?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  hasAccident?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isFirstOwner?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isOnOffer?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isHighlighted?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isSold?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
