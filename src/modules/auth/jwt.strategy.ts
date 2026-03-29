import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtUser } from './jwt-user.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET', 'change-me'),
    });
  }

  validate(payload: {
    sub: string;
    email: string;
    roles?: string[];
    shopId?: string | null;
    shopName?: string | null;
  }): JwtUser {
    return {
      userId: payload.sub,
      email: payload.email,
      roles: payload.roles ?? [],
      shopId: payload.shopId ?? null,
      shopName: payload.shopName ?? null,
    };
  }
}
