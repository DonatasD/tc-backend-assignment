import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { CreateUserDto } from './dto/createUser.dto';
import { In, LessThan, MoreThan, Not, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { addHours, toDate } from 'date-fns';
import { FindAvailableMentorsDto } from './dto/findAvailableMentors.dto';
import { UserRole } from './types/userRole';
import { ReviewStatus } from '../review/types/reviewStatus';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  findOneById(id: number) {
    return this.userRepository.findOneBy({ id });
  }

  findOneByEmail(email: string) {
    return this.userRepository.findOneBy({ email });
  }

  async findAvailableMentors(findAvailableMentorsDto: FindAvailableMentorsDto) {
    const startRange = toDate(findAvailableMentorsDto.startDateTime);
    const endRange = addHours(startRange, 1);

    const bookedMentors = await this.userRepository.find({
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

    const bookedMentorIds = bookedMentors.map((mentor) => mentor.id);

    const availableMentors = await this.userRepository.find({
      select: {
        id: true,
        email: true,
        name: true,
      },
      where: {
        role: UserRole.Mentor,
        id: Not(In(bookedMentorIds)),
      },
    });
    return availableMentors;
  }

  async create(user: CreateUserDto) {
    try {
      const existingUser = await this.userRepository.findOne({
        where: {
          email: user.email,
        },
      });
      if (existingUser) {
        throw new BadRequestException('User email is already taken');
      }
      const { password, ...rest } = user;
      const hashedPassword = await bcrypt.hash(password, 10);
      return this.userRepository.save({
        password: hashedPassword,
        ...rest,
      });
    } catch (e) {
      Logger.error('Failed to create user', e);
      throw e;
    }
  }
}
