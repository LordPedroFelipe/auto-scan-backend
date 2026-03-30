import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsIn,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum NotificationFrequency {
  Immediate = 'immediate',
  Daily = 'daily',
  Weekly = 'weekly',
  Monthly = 'monthly',
}

export const NOTIFICATION_CATEGORY_KEYS = [
  'leads',
  'test_drives',
  'billing',
  'inventory',
  'platform',
] as const;

export class NotificationPreferenceDto {
  @ApiProperty({ enum: NOTIFICATION_CATEGORY_KEYS, example: 'leads' })
  @IsIn(NOTIFICATION_CATEGORY_KEYS)
  key!: (typeof NOTIFICATION_CATEGORY_KEYS)[number];

  @ApiProperty({ example: true })
  @IsBoolean()
  email!: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  whatsapp!: boolean;

  @ApiProperty({ example: false })
  @IsBoolean()
  sms!: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  push!: boolean;

  @ApiProperty({ enum: NotificationFrequency, example: NotificationFrequency.Immediate })
  @IsEnum(NotificationFrequency)
  frequency!: NotificationFrequency;
}

export class UpdateNotificationPreferencesDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  shopId!: string;

  @ApiProperty({ type: NotificationPreferenceDto, isArray: true })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => NotificationPreferenceDto)
  preferences!: NotificationPreferenceDto[];
}
