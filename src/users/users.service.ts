import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { CreateUserDto } from './dto/createUser.dto';
import { In, LessThan, MoreThan, Not, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { addHours, toDate } from 'date-fns';
import { FindAvailableMentorsDto } from './dto/findAvailableMentors.dto';
import { UserRole } from './types/userRole';
import { ReviewStatus } from '../reviews/types/reviewStatus';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  findOneById(id: number) {
    return this.usersRepository.findOneBy({ id });
  }

  findOneByEmail(email: string) {
    return this.usersRepository.findOneBy({ email });
  }

  async findAvailable(findAvailableMentorsDto: FindAvailableMentorsDto) {
    const startRange = toDate(findAvailableMentorsDto.startDateTime);
    const endRange = addHours(startRange, 1);

    return this.usersRepository.find({
      select: {
        id: true,
        email: true,
        name: true,
      },
      where: {
        role: UserRole.Mentor,
        mentorSessions: {
          startDateTime: LessThan(endRange),
          endDateTime: MoreThan(startRange),
          status: Not(In([ReviewStatus.Cancelled])),
        },
      },
    });
  }

  async create(user: CreateUserDto) {
    try {
      const existingUser = await this.usersRepository.findOne({
        where: {
          email: user.email,
        },
      });
      if (existingUser) {
        throw new BadRequestException('User email is already taken');
      }
      const { password, ...rest } = user;
      const hashedPassword = await bcrypt.hash(password, 10);
      return this.usersRepository.save({
        password: hashedPassword,
        ...rest,
      });
    } catch (e) {
      Logger.error('Failed to create user', e);
      throw e;
    }
  }
}
