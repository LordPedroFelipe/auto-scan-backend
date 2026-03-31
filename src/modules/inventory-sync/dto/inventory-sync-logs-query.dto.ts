import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

export class InventorySyncLogsQueryDto {
  @ApiPropertyOptional({ example: 1, default: 1 })
  @Transform(({ value }) => Number(value ?? 1))
  @IsInt()
  @Min(1)
  page = 1;

  @ApiPropertyOptional({ example: 10, enum: [10, 20, 50], default: 10 })
  @Transform(({ value }) => Number(value ?? 10))
  @IsInt()
  @IsIn([10, 20, 50])
  pageSize = 10;

  @ApiPropertyOptional({ example: 'kafka' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: 'success', enum: ['success', 'error'] })
  @IsOptional()
  @IsIn(['success', 'error'])
  status?: 'success' | 'error';

  @ApiPropertyOptional({ example: 'manual', enum: ['manual', 'cron', 'startup', 'bulk'] })
  @IsOptional()
  @IsIn(['manual', 'cron', 'startup', 'bulk'])
  triggerType?: 'manual' | 'cron' | 'startup' | 'bulk';

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  shopId?: string;

  @ApiPropertyOptional({ example: '2026-03-01' })
  @IsOptional()
  @IsString()
  dateFrom?: string;

  @ApiPropertyOptional({ example: '2026-03-30' })
  @IsOptional()
  @IsString()
  dateTo?: string;
}
