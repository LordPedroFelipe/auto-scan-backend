import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { TestDriveStatus } from '../entities/test-drive.entity';

export class CreateTestDriveDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  vehicleId!: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  shopId?: string;

  @IsOptional()
  @IsUUID()
  leadId?: string;

  @ApiProperty({ example: 'Fernanda Compradora' })
  @IsString()
  customerName!: string;

  @IsOptional()
  @IsEmail()
  customerEmail?: string;

  @IsOptional()
  @IsString()
  customerPhone?: string;

  @ApiProperty({ example: '2026-04-02' })
  @IsString()
  preferredDate!: string;

  @IsOptional()
  @IsString()
  preferredTime?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ enum: TestDriveStatus, example: TestDriveStatus.Pending })
  @IsOptional()
  @IsEnum(TestDriveStatus)
  status?: TestDriveStatus;
}
