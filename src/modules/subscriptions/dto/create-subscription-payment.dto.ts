import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateSubscriptionPaymentDto {
  @ApiProperty({ example: 799, minimum: 0 })
  @IsNumber()
  @Min(0)
  amount!: number;

  @ApiProperty({ example: '2026-04-01T00:00:00.000Z' })
  @IsString()
  startDate!: string;

  @ApiProperty({ example: '2026-05-01T00:00:00.000Z' })
  @IsString()
  endDate!: string;

  @ApiProperty({ example: 'pending' })
  @IsString()
  status!: string;

  @ApiPropertyOptional({ example: 'https://asaas.com/i/123456' })
  @IsOptional()
  @IsString()
  invoiceUrl?: string | null;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  userId?: string | null;
}
