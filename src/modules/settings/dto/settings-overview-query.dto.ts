import { IsOptional, IsUUID } from 'class-validator';

export class SettingsOverviewQueryDto {
  @IsOptional()
  @IsUUID()
  shopId?: string;
}
