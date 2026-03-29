import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'Joao Vendedor' })
  @IsString()
  userName!: string;

  @ApiProperty({ example: 'joao@scandrive.com.br' })
  @IsEmail()
  email!: string;

  @ApiPropertyOptional({ example: '+55 11 98888-7777' })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiPropertyOptional({ example: 'Senha@123', minLength: 6 })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @ApiPropertyOptional({ example: ['Seller'] })
  @IsOptional()
  @IsArray()
  roles?: string[];

  @ApiPropertyOptional({ example: ['Module.Leads:Permission.View'] })
  @IsOptional()
  @IsArray()
  claims?: string[];

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  shopId?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
