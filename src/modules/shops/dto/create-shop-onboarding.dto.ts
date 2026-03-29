import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ValidateNested,
  IsBoolean,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Min,
  MinLength,
} from 'class-validator';

class CreateMasterUserDto {
  @ApiProperty({ example: 'Maria Gestora' })
  @IsString()
  userName!: string;

  @ApiProperty({ example: 'maria@loja.com.br' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'Senha@123', minLength: 6 })
  @IsString()
  @MinLength(6)
  password!: string;

  @ApiPropertyOptional({ example: '+55 11 99999-9999' })
  @IsOptional()
  @IsString()
  phoneNumber?: string;
}

export class CreateShopOnboardingDto {
  @ApiProperty({ example: 'ScanDrive Motors' })
  @IsString()
  name!: string;

  @ApiPropertyOptional({ example: 'Loja criada pelo fluxo de onboarding.' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: '12345678000199' })
  @IsOptional()
  @IsString()
  @Length(14, 18)
  cnpj?: string;

  @ApiProperty({ example: 'contato@loja.com.br' })
  @IsEmail()
  email!: string;

  @ApiPropertyOptional({ example: '+55 11 4002-8922' })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiPropertyOptional({ example: 'Av. Brasil, 500' })
  @IsOptional()
  @IsString()
  addressLine?: string;

  @ApiPropertyOptional({ example: 'Campinas' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ example: 'SP' })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({ example: '13010-000' })
  @IsOptional()
  @IsString()
  zipCode?: string;

  @ApiPropertyOptional({ example: 50, minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  qrCodeLimit?: number;

  @ApiPropertyOptional({ example: 'https://fornecedor.com/feed.xml' })
  @IsOptional()
  @IsString()
  inventoryFeedUrl?: string;

  @ApiPropertyOptional({ example: 'revenda-x' })
  @IsOptional()
  @IsString()
  inventorySourceCode?: string;

  @ApiPropertyOptional({ example: '0 */6 * * *' })
  @IsOptional()
  @IsString()
  inventorySyncCron?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  inventorySyncEnabled?: boolean;

  @ApiProperty({ type: CreateMasterUserDto })
  @ValidateNested()
  @Type(() => CreateMasterUserDto)
  masterUser!: CreateMasterUserDto;
}
