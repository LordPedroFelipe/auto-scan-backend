import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({ example: 'token-seguro-recebido-por-email' })
  @IsString()
  token!: string;

  @ApiProperty({ example: 'NovaSenha@123', minLength: 6 })
  @IsString()
  @MinLength(6)
  password!: string;
}
