import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthDto } from './dto/auth.dto';
import { SuccessAuthDto } from './dto/successAuth.dto';
import { JwtPayload } from './types/jwtPayload';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async signIn(authDto: AuthDto): Promise<SuccessAuthDto> {
    try {
      if (!authDto.password) {
        throw new UnauthorizedException();
      }
      const user = await this.userRepository.findOne({
        select: {
          password: true,
          email: true,
          id: true,
          role: true,
        },
        where: {
          email: authDto.email,
        },
      });

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
