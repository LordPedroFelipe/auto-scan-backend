import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export enum BillingCheckoutMethod {
  Pix = 'PIX',
  Boleto = 'BOLETO',
  Undefined = 'UNDEFINED',
}

export enum BillingCycle {
  Monthly = 'Monthly',
  Yearly = 'Yearly',
}

export class CreateBillingCheckoutDto {
  @ApiPropertyOptional({ enum: BillingCycle, example: BillingCycle.Monthly })
  @IsOptional()
  @IsEnum(BillingCycle)
  billingCycle?: BillingCycle;

  @ApiProperty({ enum: BillingCheckoutMethod, example: BillingCheckoutMethod.Pix })
  @IsEnum(BillingCheckoutMethod)
  paymentMethod!: BillingCheckoutMethod;

  @ApiPropertyOptional({ example: 'Assinatura Plano Premium - Abril/2026' })
  @IsOptional()
  @IsString()
  @MaxLength(160)
  description?: string;

  @ApiPropertyOptional({ example: '2026-04-15' })
  @IsOptional()
  @IsDateString()
  dueDate?: string;
}
