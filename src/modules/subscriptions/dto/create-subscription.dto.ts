import { IsBoolean, IsIn, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateSubscriptionDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Min(0)
  price!: number;

  @IsNumber()
  @Min(1)
  durationInDays!: number;

  @IsNumber()
  @Min(0)
  qrCodeLimit!: number;

  @IsString()
  @IsIn(['Monthly', 'Yearly'])
  type!: 'Monthly' | 'Yearly';

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
