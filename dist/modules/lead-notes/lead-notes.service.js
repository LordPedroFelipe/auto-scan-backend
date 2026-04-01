"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeadNotesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const lead_entity_1 = require("../leads/entities/lead.entity");
const user_entity_1 = require("../users/entities/user.entity");
const lead_note_entity_1 = require("./entities/lead-note.entity");
let LeadNotesService = class LeadNotesService {
    constructor(notesRepository, leadsRepository, usersRepository) {
        this.notesRepository = notesRepository;
        this.leadsRepository = leadsRepository;
        this.usersRepository = usersRepository;
    }
    async findAll(query) {
        const pageNumber = query.PageNumber ?? 1;
        const pageSize = query.PageSize ?? 10;
        const qb = this.notesRepository
            .createQueryBuilder('note')
            .leftJoinAndSelect('note.user', 'user');
        if (query.LeadId)
            qb.andWhere('note.leadId = :leadId', { leadId: query.LeadId });
        if (query.UserId)
            qb.andWhere('note.userId = :userId', { userId: query.UserId });
        if (query.Type)
            qb.andWhere('note.type = :type', { type: query.Type });
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
    async findByLead(leadId, query) {
        return this.findAll({ ...query, LeadId: leadId });
    }
    async findOne(id) {
        const note = await this.notesRepository.findOne({
            where: { id },
            relations: { user: true },
        });
        if (!note)
            throw new common_1.NotFoundException('Nota não encontrada.');
        return this.toResponse(note);
    }
    async create(dto) {
        const lead = await this.leadsRepository.findOne({ where: { id: dto.leadId } });
        if (!lead)
            throw new common_1.BadRequestException('Lead não encontrado.');
        if (dto.userId) {
            const user = await this.usersRepository.findOne({ where: { id: dto.userId } });
            if (!user)
                throw new common_1.BadRequestException('Usuário não encontrado.');
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
    async update(id, dto) {
        const note = await this.notesRepository.findOne({ where: { id } });
        if (!note)
            throw new common_1.NotFoundException('Nota não encontrada.');
        Object.assign(note, dto);
        await this.notesRepository.save(note);
        return this.findOne(id);
    }
    async remove(id) {
        const note = await this.notesRepository.findOne({ where: { id } });
        if (!note)
            throw new common_1.NotFoundException('Nota não encontrada.');
        await this.notesRepository.remove(note);
        return { success: true };
    }
    listTypes() {
        return Object.values(lead_note_entity_1.LeadNoteType);
    }
    toResponse(note) {
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
};
exports.LeadNotesService = LeadNotesService;
exports.LeadNotesService = LeadNotesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(lead_note_entity_1.LeadNoteEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(lead_entity_1.LeadEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.UserEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], LeadNotesService);
