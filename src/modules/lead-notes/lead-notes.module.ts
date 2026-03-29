import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeadEntity } from '../leads/entities/lead.entity';
import { UserEntity } from '../users/entities/user.entity';
import { LeadNotesController } from './lead-notes.controller';
import { LeadNotesService } from './lead-notes.service';
import { LeadNoteEntity } from './entities/lead-note.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LeadNoteEntity, LeadEntity, UserEntity])],
  controllers: [LeadNotesController],
  providers: [LeadNotesService],
})
export class LeadNotesModule {}
