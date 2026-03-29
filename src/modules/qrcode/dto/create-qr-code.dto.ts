import { IsOptional, IsString } from 'class-validator';

export class CreateQrCodeDto {
  @IsString()
  redirectType!: string;

  @IsString()
  redirectId!: string;

  @IsOptional()
  @IsString()
  vehiclePlate?: string;
}
