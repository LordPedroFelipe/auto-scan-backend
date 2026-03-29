import { IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateSubscriptionPaymentDto {
  @IsNumber()
  @Min(0)
  amount!: number;

  @IsString()
  startDate!: string;

  @IsString()
  endDate!: string;

  @IsString()
  status!: string;

  @IsOptional()
  @IsString()
  invoiceUrl?: string | null;

  @IsOptional()
  @IsUUID()
  userId?: string | null;
}
