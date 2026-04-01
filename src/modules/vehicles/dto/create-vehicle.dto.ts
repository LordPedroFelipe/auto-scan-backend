import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

const toOptionalString = ({ value }: { value: unknown }) => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  return String(value).trim();
};

const toOptionalNumber = ({ value }: { value: unknown }) => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? value : parsed;
};

const toOptionalBoolean = ({ value }: { value: unknown }) => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true') {
      return true;
    }
    if (normalized === 'false') {
      return false;
    }
  }

  return value;
};

const toStringArray = ({ value }: { value: unknown }) => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  if (Array.isArray(value)) {
    return value.filter((item) => typeof item === 'string' && item.trim().length > 0);
  }

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.filter(
          (item) => typeof item === 'string' && item.trim().length > 0,
        );
      }
    } catch {
      return value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }

  return undefined;
};

export class CreateVehicleDto {
  @ApiProperty({ format: 'uuid' })
  @Transform(toOptionalString)
  @IsUUID()
  shopId!: string;

  @ApiProperty({ example: 'Toyota' })
  @Transform(toOptionalString)
  @IsString()
  brand!: string;

  @ApiProperty({ example: 'Corolla' })
  @Transform(toOptionalString)
  @IsString()
  model!: string;

  @ApiPropertyOptional({ example: 'XEi 2.0 CVT' })
  @IsOptional()
  @Transform(toOptionalString)
  @IsString()
  version?: string;

  @ApiProperty({ example: 2023, minimum: 1900 })
  @Transform(toOptionalNumber)
  @IsNumber()
  @Min(1900)
  year!: number;

  @IsOptional()
  @Transform(toOptionalString)
  @IsString()
  plate?: string;

  @IsOptional()
  @Transform(toOptionalString)
  @IsString()
  color?: string;

  @IsOptional()
  @Transform(toOptionalString)
  @IsString()
  transmission?: string;

  @IsOptional()
  @Transform(toOptionalString)
  @IsString()
  fuelType?: string;

  @IsOptional()
  @Transform(toOptionalString)
  @IsString()
  condition?: string;

  @IsOptional()
  @Transform(toOptionalString)
  @IsString()
  categoryType?: string;

  @IsOptional()
  @Transform(toOptionalNumber)
  @IsNumber()
  mileage?: number;

  @ApiProperty({ example: 119900, minimum: 0 })
  @Transform(toOptionalNumber)
  @IsNumber()
  @Min(0)
  price!: number;

  @IsOptional()
  @Transform(toOptionalString)
  @IsString()
  city?: string;

  @IsOptional()
  @Transform(toOptionalString)
  @IsString()
  state?: string;

  @IsOptional()
  @Transform(toOptionalString)
  @IsString()
  description?: string;

  @IsOptional()
  @Transform(toOptionalNumber)
  @IsNumber()
  ownersCount?: number;

  @ApiPropertyOptional({ example: ['https://cdn.site.com/foto-1.webp'] })
  @IsOptional()
  @Transform(toStringArray)
  @IsArray()
  photoUrls?: string[];

  @ApiPropertyOptional({ example: ['https://cdn.site.com/foto-1.webp'] })
  @IsOptional()
  @Transform(toStringArray)
  @IsArray()
  retainedPhotoUrls?: string[];

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @Transform(toOptionalBoolean)
  @IsBoolean()
  hasAuction?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @Transform(toOptionalBoolean)
  @IsBoolean()
  hasAccident?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @Transform(toOptionalBoolean)
  @IsBoolean()
  isFirstOwner?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @Transform(toOptionalBoolean)
  @IsBoolean()
  isConsigned?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @Transform(toOptionalBoolean)
  @IsBoolean()
  isOnOffer?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @Transform(toOptionalBoolean)
  @IsBoolean()
  isHighlighted?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @Transform(toOptionalBoolean)
  @IsBoolean()
  isSold?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @Transform(toOptionalBoolean)
  @IsBoolean()
  isActive?: boolean;
}
