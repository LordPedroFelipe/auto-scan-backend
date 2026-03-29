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
  @IsUUID()
  shopId!: string;

  @IsString()
  brand!: string;

  @IsString()
  model!: string;

  @IsOptional()
  @IsString()
  version?: string;

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

  @IsOptional()
  @IsArray()
  photoUrls?: string[];

  @IsOptional()
  @IsBoolean()
  hasAuction?: boolean;

  @IsOptional()
  @IsBoolean()
  hasAccident?: boolean;

  @IsOptional()
  @IsBoolean()
  isFirstOwner?: boolean;

  @IsOptional()
  @IsBoolean()
  isOnOffer?: boolean;

  @IsOptional()
  @IsBoolean()
  isHighlighted?: boolean;

  @IsOptional()
  @IsBoolean()
  isSold?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
