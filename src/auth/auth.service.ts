import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { AuthDto } from './dto/auth.dto';
import { SuccessAuthDto } from './dto/success-auth.dto';
import { JwtPayload } from './types/jwtPayload';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signIn(authDto: AuthDto): Promise<SuccessAuthDto> {
    try {
      if (!authDto.password) {
        throw new UnauthorizedException();
      }
      const user = await this.usersService.findOneByEmail(authDto.email);

      if (!user) {
        throw new UnauthorizedException();
      }
      const isMatchingPassword = await bcrypt.compare(
        authDto.password,
        user.password,
      );
      if (!isMatchingPassword) {
        throw new UnauthorizedException();
      }

      // Expiration calculation is done by jwtService
      const payload: Omit<JwtPayload, 'exp'> = {
        email: user.email,
        role: user.role,
        sub: user.id,
        iat: Date.now(),
      };

      const accessToken = await this.jwtService.signAsync(payload);
      return {
        accessToken,
        type: 'Bearer',
      };
    } catch (e) {
      throw new UnauthorizedException();
    }
  }
}
