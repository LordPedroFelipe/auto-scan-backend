import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateSubscriptionDto {
  @ApiProperty({ example: 'Plano Premium' })
  @IsString()
  name!: string;

  @ApiPropertyOptional({ example: 'Plano com IA, estoque e relatorios.' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 799, minimum: 0 })
  @IsNumber()
  @Min(0)
  price!: number;

  @ApiProperty({ example: 30, minimum: 1 })
  @IsNumber()
  @Min(1)
  durationInDays!: number;

  @ApiProperty({ example: 500, minimum: 0 })
  @IsNumber()
  @Min(0)
  qrCodeLimit!: number;

  @ApiProperty({ enum: ['Monthly', 'Yearly'], example: 'Monthly' })
  @IsString()
  @IsIn(['Monthly', 'Yearly'])
  type!: 'Monthly' | 'Yearly';

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
