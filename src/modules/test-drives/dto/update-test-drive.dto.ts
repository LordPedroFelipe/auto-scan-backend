import { PartialType } from '@nestjs/swagger';
import { CreateTestDriveDto } from './create-test-drive.dto';

export class UpdateTestDriveDto extends PartialType(CreateTestDriveDto) {}
