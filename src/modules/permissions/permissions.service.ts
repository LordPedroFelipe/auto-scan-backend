import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../users/entities/user.entity';

const AVAILABLE_ROLES = ['Admin', 'ShopOwner', 'ShopSeller', 'Seller', 'Support'];

const AVAILABLE_CLAIMS = [
  'Module.Users:Permission.View',
  'Module.Users:Permission.Create',
  'Module.Users:Permission.Edit',
  'Module.Users:Permission.Delete',
  'Module.Shops:Permission.View',
  'Module.Shops:Permission.Create',
  'Module.Shops:Permission.Edit',
  'Module.Vehicles:Permission.View',
  'Module.Vehicles:Permission.Create',
  'Module.Vehicles:Permission.Edit',
  'Module.Vehicles:Permission.Delete',
  'Module.Leads:Permission.View',
  'Module.Leads:Permission.Create',
  'Module.Leads:Permission.Edit',
  'Module.TestDrives:Permission.View',
  'Module.TestDrives:Permission.Create',
  'Module.Reports:Permission.View',
  'Module.Settings:Permission.View',
];

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
  ) {}

  listRoles() {
    return AVAILABLE_ROLES;
  }

  listModules() {
    return Array.from(
      new Set(AVAILABLE_CLAIMS.map((claim) => claim.split(':')[0])),
    ).sort();
  }

  listAvailableClaims() {
    return AVAILABLE_CLAIMS;
  }

  async getUserRoles(userId: string) {
    const user = await this.findUser(userId);
    return user.roles ?? [];
  }

  async updateUserRoles(userId: string, roles: string[]) {
    const user = await this.findUser(userId);
    user.roles = roles ?? [];
    await this.usersRepository.save(user);
    return { success: true };
  }

  async getUserClaims(userId: string) {
    const user = await this.findUser(userId);
    return user.claims ?? [];
  }

  async updateUserClaims(userId: string, claims: string[]) {
    const user = await this.findUser(userId);
    user.claims = claims ?? [];
    await this.usersRepository.save(user);
    return { success: true };
  }

  private async findUser(userId: string) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }
    return user;
  }
}
