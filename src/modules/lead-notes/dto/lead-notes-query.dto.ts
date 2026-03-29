import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

const toNumber = ({ value }: { value: string }) =>
  value === undefined || value === null || value === '' ? undefined : Number(value);

export class LeadNotesQueryDto {
  @IsOptional()
  @IsUUID()
  LeadId?: string;

  @IsOptional()
  @IsUUID()
  UserId?: string;

  @IsOptional()
  @IsString()
  Type?: string;

  @IsOptional()
  @Transform(toNumber)
  @IsNumber()
  @Min(1)
  PageNumber?: number = 1;

  @IsOptional()
  @Transform(toNumber)
  @IsNumber()
  @Min(1)
  PageSize?: number = 10;
}
