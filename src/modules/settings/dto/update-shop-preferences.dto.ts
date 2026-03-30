import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsObject, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export enum LeadRoutingMode {
  Manual = 'manual',
  ShopOwner = 'shop_owner',
  RoundRobin = 'round_robin',
}

export class ShopPreferencesDto {
  @ApiProperty({ enum: LeadRoutingMode, example: LeadRoutingMode.Manual })
  @IsEnum(LeadRoutingMode)
  leadRoutingMode!: LeadRoutingMode;

  @ApiProperty({ example: true })
  @IsBoolean()
  showVehiclePrice!: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  allowPublicTestDriveScheduling!: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  enablePublicCatalog!: boolean;

  @ApiProperty({ example: false })
  @IsBoolean()
  receiveLeadsOutsideBusinessHours!: boolean;
}

export class UpdateShopPreferencesDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  shopId!: string;

  @ApiProperty({ type: ShopPreferencesDto })
  @IsObject()
  @ValidateNested()
  @Type(() => ShopPreferencesDto)
  preferences!: ShopPreferencesDto;
}
