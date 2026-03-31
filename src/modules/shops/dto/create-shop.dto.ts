import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
  @ApiProperty({ example: 'ScanDrive Premium Motors' })
  @IsString()
  name!: string;

  @ApiPropertyOptional({ example: 'Loja focada em seminovos premium.' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: '12345678000199' })
  @IsOptional()
  @IsString()
  @Length(14, 18)
  cnpj?: string;

  @ApiPropertyOptional({ example: 'contato@loja.com.br' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '+55 11 4002-8922' })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiPropertyOptional({ example: 'Av. Paulista, 1000' })
  @IsOptional()
  @IsString()
  addressLine?: string;

  @ApiPropertyOptional({ example: 'Sao Paulo' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ example: 'SP' })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({ example: '01310-100' })
  @IsOptional()
  @IsString()
  zipCode?: string;

  @ApiPropertyOptional({ example: 120, minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  qrCodeLimit?: number;

  @ApiPropertyOptional({ example: 'https://fornecedor.com/feed.xml' })
  @IsOptional()
  @IsString()
  inventoryFeedUrl?: string;

  @ApiPropertyOptional({ example: 'POST' })
  @IsOptional()
  @IsString()
  inventoryFeedMethod?: string;

  @ApiPropertyOptional({ example: '{"Accept":"application/json"}' })
  @IsOptional()
  @IsString()
  inventoryRequestHeaders?: string;

  @ApiPropertyOptional({ example: '{"token":"abc"}' })
  @IsOptional()
  @IsString()
  inventoryRequestBody?: string;

  @ApiPropertyOptional({ example: 'revenda-x' })
  @IsOptional()
  @IsString()
  inventorySourceCode?: string;

  @ApiPropertyOptional({ example: 'kafka-litoralcar-json' })
  @IsOptional()
  @IsString()
  inventorySourceName?: string;

  @ApiPropertyOptional({ example: 'https://302017-litoralcar-org.s3.unifique.cloud/litoralcar' })
  @IsOptional()
  @IsString()
  inventoryImageBucketBaseUrl?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  inventoryMasterUserId?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  inventorySellerUserId?: string;

  @ApiPropertyOptional({ example: '0 */6 * * *' })
  @IsOptional()
  @IsString()
  inventorySyncCron?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  inventorySyncEnabled?: boolean;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  ownerId?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
