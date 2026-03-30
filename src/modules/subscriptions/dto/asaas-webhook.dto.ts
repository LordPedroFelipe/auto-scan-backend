import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsObject, IsOptional, IsString } from 'class-validator';

export class AsaasWebhookDto {
  @ApiPropertyOptional({ example: 'PAYMENT_RECEIVED' })
  @IsOptional()
  @IsString()
  event?: string;

  @ApiPropertyOptional({
    type: 'object',
    additionalProperties: true,
  })
  @IsOptional()
  @IsObject()
  payment?: Record<string, unknown>;
}
