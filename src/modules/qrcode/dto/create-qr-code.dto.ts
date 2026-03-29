import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateQrCodeDto {
  @ApiProperty({ example: 'vehicle' })
  @IsString()
  redirectType!: string;

  @ApiProperty({ example: 'c3c8ce2f-86de-4d18-98d8-3df1f4b5db8a' })
  @IsString()
  redirectId!: string;

  @ApiPropertyOptional({ example: 'ABC1D23' })
  @IsOptional()
  @IsString()
  vehiclePlate?: string;
}
