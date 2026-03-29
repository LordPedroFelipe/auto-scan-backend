import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmailWithPassword(dto.email);

    if (!user?.passwordHash) {
      throw new UnauthorizedException('Email ou senha inválidos.');
    }

    const isValidPassword = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isValidPassword) {
      throw new UnauthorizedException('Email ou senha inválidos.');
    }

    const safeUser = this.usersService.toSafeUser(user);
    const payload = {
      sub: safeUser.id,
      email: safeUser.email,
      roles: safeUser.roles,
      shopId: safeUser.shopId ?? null,
      shopName: safeUser.shop?.name ?? null,
      'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier': safeUser.id,
      'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress': safeUser.email,
      'http://schemas.microsoft.com/ws/2008/06/identity/claims/role': safeUser.roles,
      ShopId: safeUser.shopId ?? null,
      ShopName: safeUser.shop?.name ?? null,
      Permission: safeUser.claims ?? [],
    };

    return {
      token: await this.jwtService.signAsync(payload),
      user: {
        id: safeUser.id,
        userName: safeUser.userName,
        email: safeUser.email,
        phoneNumber: safeUser.phoneNumber,
        roles: safeUser.roles,
        shopId: safeUser.shopId,
        shopName: safeUser.shop?.name ?? null,
      },
    };
  }

  async register(dto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(dto.email);
    if (existingUser) {
      throw new BadRequestException('Já existe um usuário com este email.');
    }

    await this.usersService.create({
      userName: dto.userName,
      email: dto.email,
      phoneNumber: dto.phoneNumber,
      password: dto.password,
      roles: dto.roles,
      shopId: dto.shopId,
    });

    return this.login({
      email: dto.email,
      password: dto.password,
    });
  }

  async me(userId: string) {
    return this.usersService.findOne(userId);
  }
}
