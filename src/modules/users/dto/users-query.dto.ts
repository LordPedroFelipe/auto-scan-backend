import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

const toNumber = ({ value }: { value: string }) =>
  value === undefined || value === null || value === '' ? undefined : Number(value);

export class UsersQueryDto {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsString()
  search?: string;

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
  pageNumber?: number = 1;

  @IsOptional()
  @Transform(toNumber)
  @IsNumber()
  @Min(1)
  PageNumber?: number;

  @IsOptional()
  @Transform(toNumber)
  @IsNumber()
  @Min(1)
  pageSize?: number = 10;

  @IsOptional()
  @Transform(toNumber)
  @IsNumber()
  @Min(1)
  PageSize?: number;
}
