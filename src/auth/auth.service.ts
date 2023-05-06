import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { LoginDto, UserPayloadDto } from './auth.dto';
import { UserService } from '@/user/user.service';
import { AppConfig } from '@/common/config';
import { UserDto } from '@/user/user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService<AppConfig>,
    private readonly jwtService: JwtService,
  ) {}

  async login(info: LoginDto) {
    const user = await this.userService.findOne({ email: info.email });

    if (!user) {
      return false;
    }

    if (!(await this.comparePassword(info.password, user.password))) {
      return false;
    }

    const payload = this.createTokenPayload(user);

    const token = await this.createToken(payload);

    // Make sure we don't return the password hash
    delete user.password;
    delete user.seed;

    return {
      token,
      user,
    };
  }

  async refresh(payload: UserPayloadDto) {
    const user = await this.userService.findOne({
      id: payload.id,
      hideSensitive: false,
    });

    if (!user) {
      return false;
    }

    if (!payload.seed || !user.seed) {
      await this.userService.updateSeed(user.id);
      return false;
    }

    if (payload.seed !== user.seed) {
      return false;
    }

    const userPayload = this.createTokenPayload(user);

    const token = await this.createToken(userPayload);

    // Make sure we don't return the password hash
    delete user.password;
    delete user.seed;

    return {
      token,
      user,
    };
  }

  private createTokenPayload(user: UserDto): UserPayloadDto {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      seed: user.seed,
    };
  }

  async hashPassword(password: string) {
    return await bcrypt.hash(password, 10);
  }

  async comparePassword(password: string, passwordHash: string) {
    return await bcrypt.compare(password, passwordHash);
  }

  private async createToken(payload: any) {
    const expire = this.configService.get('jwt').expiresIn
      ? Number.parseInt(this.configService.get('jwt').expiresIn)
      : 60 * 10;

    return await this.jwtService.signAsync(payload, {
      secret: this.configService.get('jwt').secret,
      expiresIn: expire,
    });
  }
}
