import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({ example: 'gestor@scandrive.com.br' })
  @IsEmail()
  email!: string;
}
