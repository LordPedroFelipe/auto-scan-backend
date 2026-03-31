import { PartialType } from '@nestjs/swagger';
import { CreateSaleClosureDto } from './create-sale-closure.dto';

export class UpdateSaleClosureDto extends PartialType(CreateSaleClosureDto) {}
