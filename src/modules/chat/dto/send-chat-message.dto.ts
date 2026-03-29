import { IsEmail, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class SendChatMessageDto {
  @IsString()
  sessionId!: string;

  @IsString()
  @MaxLength(4000)
  message!: string;

  @IsOptional()
  @IsUUID()
  shopId?: string;

  @IsOptional()
  @IsUUID()
  vehicleId?: string;

  @IsOptional()
  @IsString()
  plate?: string;

  @IsOptional()
  @IsString()
  customerName?: string;

  @IsOptional()
  @IsEmail()
  customerEmail?: string;

  @IsOptional()
  @IsString()
  customerPhone?: string;

  @IsOptional()
  @IsString()
  customerCity?: string;
}
