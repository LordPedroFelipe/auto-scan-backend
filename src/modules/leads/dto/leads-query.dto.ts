import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

const toNumber = ({ value }: { value: string }) =>
  value === undefined || value === null || value === '' ? undefined : Number(value);

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
}
