import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LeadEntity } from '../leads/entities/lead.entity';
import { UserEntity } from '../users/entities/user.entity';
import { CreateLeadNoteDto } from './dto/create-lead-note.dto';
import { LeadNotesQueryDto } from './dto/lead-notes-query.dto';
import { UpdateLeadNoteDto } from './dto/update-lead-note.dto';
import { LeadNoteEntity, LeadNoteType } from './entities/lead-note.entity';

@Injectable()
export class LeadNotesService {
  constructor(
    @InjectRepository(LeadNoteEntity)
    private readonly notesRepository: Repository<LeadNoteEntity>,
    @InjectRepository(LeadEntity)
    private readonly leadsRepository: Repository<LeadEntity>,
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
  ) {}

  async findAll(query: LeadNotesQueryDto) {
    const pageNumber = query.PageNumber ?? 1;
    const pageSize = query.PageSize ?? 10;

    const qb = this.notesRepository
      .createQueryBuilder('note')
      .leftJoinAndSelect('note.user', 'user');

    if (query.LeadId) qb.andWhere('note.leadId = :leadId', { leadId: query.LeadId });
    if (query.UserId) qb.andWhere('note.userId = :userId', { userId: query.UserId });
    if (query.Type) qb.andWhere('note.type = :type', { type: query.Type });

    qb.orderBy('note.createdAt', 'DESC');
    qb.skip((pageNumber - 1) * pageSize);
    qb.take(pageSize);

    const [items, totalCount] = await qb.getManyAndCount();

    return {
      items: items.map((item) => this.toResponse(item)),
      pageNumber,
      pageSize,
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize) || 1,
      hasPreviousPage: pageNumber > 1,
      hasNextPage: pageNumber * pageSize < totalCount,
    };
  }

  async findByLead(leadId: string, query: LeadNotesQueryDto) {
    return this.findAll({ ...query, LeadId: leadId });
  }

  async findOne(id: string) {
    const note = await this.notesRepository.findOne({
      where: { id },
      relations: { user: true },
    });
    if (!note) throw new NotFoundException('Nota não encontrada.');
    return this.toResponse(note);
  }

  async create(dto: CreateLeadNoteDto) {
    const lead = await this.leadsRepository.findOne({ where: { id: dto.leadId } });
    if (!lead) throw new BadRequestException('Lead não encontrado.');

    if (dto.userId) {
      const user = await this.usersRepository.findOne({ where: { id: dto.userId } });
      if (!user) throw new BadRequestException('Usuário não encontrado.');
    }

    const note = this.notesRepository.create({
      leadId: dto.leadId,
      userId: dto.userId ?? null,
      comment: dto.comment,
      type: dto.type,
    });

    const saved = await this.notesRepository.save(note);
    return this.findOne(saved.id);
  }

  async update(id: string, dto: UpdateLeadNoteDto) {
    const note = await this.notesRepository.findOne({ where: { id } });
    if (!note) throw new NotFoundException('Nota não encontrada.');
    Object.assign(note, dto);
    await this.notesRepository.save(note);
    return this.findOne(id);
  }

  async remove(id: string) {
    const note = await this.notesRepository.findOne({ where: { id } });
    if (!note) throw new NotFoundException('Nota não encontrada.');
    await this.notesRepository.remove(note);
    return { success: true };
  }

  listTypes() {
    return Object.values(LeadNoteType);
  }

  private toResponse(note: LeadNoteEntity) {
    return {
      id: note.id,
      leadId: note.leadId,
      userId: note.userId,
      userName: note.user?.userName ?? 'Sistema',
      comment: note.comment,
      type: note.type,
      createdAt: note.createdAt,
    };
  }
}
