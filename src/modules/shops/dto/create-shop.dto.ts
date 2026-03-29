import {
  IsBoolean,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Min,
} from 'class-validator';

export class CreateShopDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @Length(14, 18)
  cnpj?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

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

  @IsOptional()
  @IsUUID()
  ownerId?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
