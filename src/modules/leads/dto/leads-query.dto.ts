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

export class LeadsQueryDto {
  @IsOptional()
  @IsString()
  CustomerName?: string;

  @IsOptional()
  @IsString()
  CustomerEmail?: string;

  @IsOptional()
  @IsString()
  CustomerPhone?: string;

  @IsOptional()
  @IsString()
  CustomerCity?: string;

  @IsOptional()
  @IsString()
  Status?: string;

  @IsOptional()
  @IsUUID()
  SellerId?: string;

  @IsOptional()
  @IsUUID()
  shopId?: string;

  @IsOptional()
  @IsUUID()
  ShopId?: string;

  @IsOptional()
  @Transform(toNumber)
  @IsNumber()
  @Min(1)
  PageNumber?: number = 1;

  @IsOptional()
  @Transform(toNumber)
  @IsNumber()
  @Min(1)
  pageNumber?: number;

  @IsOptional()
  @Transform(toNumber)
  @IsNumber()
  @Min(1)
  PageSize?: number = 10;

  @IsOptional()
  @Transform(toNumber)
  @IsNumber()
  @Min(1)
  pageSize?: number;

  @IsOptional()
  @IsString()
  OrderBy?: string;

  @IsOptional()
  @IsString()
  orderBy?: string;

  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean()
  IsDescending?: boolean;

  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean()
  isDescending?: boolean;
}
