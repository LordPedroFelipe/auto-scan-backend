import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

const toNumber = ({ value }: { value: string }) =>
  value === undefined || value === null || value === '' ? undefined : Number(value);

export class UsersQueryDto {
  @ApiPropertyOptional({ example: 'joao' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ example: 'joao' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  shopId?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  ShopId?: string;

  @ApiPropertyOptional({ example: 1, minimum: 1 })
  @IsOptional()
  @Transform(toNumber)
  @IsNumber()
  @Min(1)
  pageNumber?: number = 1;

  @ApiPropertyOptional({ example: 1, minimum: 1 })
  @IsOptional()
  @Transform(toNumber)
  @IsNumber()
  @Min(1)
  PageNumber?: number;

  @ApiPropertyOptional({ example: 10, minimum: 1 })
  @IsOptional()
  @Transform(toNumber)
  @IsNumber()
  @Min(1)
  pageSize?: number = 10;

  @ApiPropertyOptional({ example: 10, minimum: 1 })
  @IsOptional()
  @Transform(toNumber)
  @IsNumber()
  @Min(1)
  PageSize?: number;
}
