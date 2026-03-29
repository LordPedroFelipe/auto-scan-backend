import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

const toNumber = ({ value }: { value: string }) =>
  value === undefined || value === null || value === '' ? undefined : Number(value);

const toBoolean = ({ value }: { value: string }) =>
  value === undefined || value === null || value === ''
    ? undefined
    : value === 'true' || value === '1';

export class VehiclesQueryDto {
  @IsOptional()
  @Transform(toNumber)
  @IsNumber()
  @Min(1)
  pageNumber?: number = 1;

  @IsOptional()
  @Transform(toNumber)
  @IsNumber()
  @Min(1)
  pageSize?: number = 10;

  @IsOptional()
  @IsUUID()
  shopId?: string;

  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  sort?: string;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsString()
  version?: string;

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
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @Transform(toNumber)
  @IsNumber()
  minPrice?: number;

  @IsOptional()
  @Transform(toNumber)
  @IsNumber()
  maxPrice?: number;

  @IsOptional()
  @Transform(toNumber)
  @IsNumber()
  minYear?: number;

  @IsOptional()
  @Transform(toNumber)
  @IsNumber()
  maxYear?: number;

  @IsOptional()
  @Transform(toNumber)
  @IsNumber()
  minMileage?: number;

  @IsOptional()
  @Transform(toNumber)
  @IsNumber()
  maxMileage?: number;

  @IsOptional()
  @Transform(toNumber)
  @IsNumber()
  ownersCountMin?: number;

  @IsOptional()
  @Transform(toNumber)
  @IsNumber()
  ownersCountMax?: number;

  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean()
  hasAuction?: boolean;

  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean()
  hasAccident?: boolean;

  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean()
  isFirstOwner?: boolean;

  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean()
  isSold?: boolean;

  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean()
  isOnOffer?: boolean;

  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean()
  isHighlighted?: boolean;

  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean()
  includeInactive?: boolean;
}
