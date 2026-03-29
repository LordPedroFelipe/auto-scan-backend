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
  @IsString()
  userName!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;
}

export class CreateShopOnboardingDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @Length(14, 18)
  cnpj?: string;

  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  addressLine?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  zipCode?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  qrCodeLimit?: number;

  @IsOptional()
  @IsString()
  inventoryFeedUrl?: string;

  @IsOptional()
  @IsString()
  inventorySourceCode?: string;

  @IsOptional()
  @IsString()
  inventorySyncCron?: string;

  @IsOptional()
  @IsBoolean()
  inventorySyncEnabled?: boolean;

  @ValidateNested()
  @Type(() => CreateMasterUserDto)
  masterUser!: CreateMasterUserDto;
}
