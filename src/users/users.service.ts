import { Injectable, Logger } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { DeepPartial, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';

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

  async create(user: CreateUserDto) {
    try {
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

  async bulkCreate(users: CreateUserDto[]) {
    try {
      const usersToSave: DeepPartial<User>[] = await Promise.all(
        users.map(async (user) => ({
          ...user,
          password: await bcrypt.hash(user.password, 10),
        })),
      );
      return this.usersRepository.save(usersToSave);
    } catch (e) {
      Logger.error('Failed to create user', e);
    }
  }
}
