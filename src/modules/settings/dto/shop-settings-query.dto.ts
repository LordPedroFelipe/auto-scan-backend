import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class ShopSettingsQueryDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  shopId!: string;
}
