import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { EmailService } from '../email/email.service';
import {
  buildResetPasswordEmailTemplate,
  buildWelcomeEmailTemplate,
} from '../email/email.templates';
import { UsersService } from '../users/users.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmailWithPassword(dto.email);

    if (!user?.passwordHash) {
      throw new UnauthorizedException('Email ou senha invalidos.');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Este usuario esta inativo.');
    }

    const isValidPassword = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isValidPassword) {
      throw new UnauthorizedException('Email ou senha invalidos.');
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
      throw new BadRequestException('Ja existe um usuario com este email.');
    }

    const createdUser = await this.usersService.create({
      userName: dto.userName,
      email: dto.email,
      phoneNumber: dto.phoneNumber,
      password: dto.password,
      roles: dto.roles,
      shopId: dto.shopId,
    });

    await this.sendWelcomeEmail(createdUser.id).catch((error: unknown) => {
      this.logger.warn(`Falha ao enviar email de boas-vindas: ${String(error)}`);
    });

    return this.login({
      email: dto.email,
      password: dto.password,
    });
  }

  async me(userId: string) {
    return this.usersService.findOne(userId);
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user?.isActive) {
      return {
        success: true,
        message:
          'Se existir uma conta com este email, enviaremos as instrucoes de recuperacao.',
      };
    }

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60);
    await this.usersService.savePasswordResetToken(user.id, token, expiresAt);

    const frontendBaseUrl = this.configService.get<string>(
      'FRONTEND_BASE_URL',
      'http://localhost:4200',
    );
    const resetUrl = `${frontendBaseUrl}/#/resetar-senha?token=${token}`;

    const result = await this.emailService.send({
      to: {
        email: user.email,
        name: user.userName,
      },
      subject: 'ScanDrive | Redefinicao de senha',
      html: buildResetPasswordEmailTemplate({
        customerName: user.userName,
        resetUrl,
        expiresInText: '1 hora',
      }),
      text: `Oi, ${user.userName}. Use este link para redefinir sua senha: ${resetUrl}. O link expira em 1 hora.`,
    });

    return {
      success: true,
      message:
        'Se existir uma conta com este email, enviaremos as instrucoes de recuperacao.',
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.usersService.findByPasswordResetToken(dto.token);

    if (!user?.passwordResetExpiresAt) {
      throw new BadRequestException('Token de recuperacao invalido.');
    }

    if (user.passwordResetExpiresAt.getTime() < Date.now()) {
      await this.usersService.clearPasswordResetToken(user.id);
      throw new BadRequestException('Token de recuperacao expirado.');
    }

    await this.usersService.updatePassword(user.id, dto.password);

    return {
      success: true,
      message: 'Senha redefinida com sucesso.',
    };
  }

  async sendWelcomeEmail(userId: string) {
    const user = await this.usersService.findOne(userId);
    const frontendBaseUrl = this.configService.get<string>(
      'FRONTEND_BASE_URL',
      'http://localhost:4200',
    );
    const loginUrl = `${frontendBaseUrl}/#/login?email=${encodeURIComponent(user.email)}`;

    const result = await this.emailService.send({
      to: {
        email: user.email,
        name: user.userName,
      },
      subject: 'ScanDrive | Sua conta esta pronta',
      html: buildWelcomeEmailTemplate({
        customerName: user.userName,
        loginUrl,
        shopName: user.shop?.name ?? null,
      }),
      text: `Oi, ${user.userName}. Sua conta ScanDrive esta pronta. Acesse ${loginUrl} para entrar na plataforma.`,
    });

    if (result.delivered) {
      await this.usersService.markWelcomeEmailSent(userId);
    }
  }
}
