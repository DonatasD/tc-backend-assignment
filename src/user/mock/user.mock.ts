import { User } from '../entities/user.entity';
import { faker } from '@faker-js/faker';
import { Repository } from 'typeorm';
import { UserService } from '../user.service';
import { MockType } from '../../utils/mock.types';
import { CreateUserDto } from '../dto/createUser.dto';
import { UserRole } from '../types/userRole';
import { FindAvailableMentorsDto } from '../dto/findAvailableMentors.dto';

export const mockUser = (user: Partial<User> = {}): User => {
  return new User({
    id: faker.number.int(),
    password: faker.internet.password(),
    email: faker.internet.email(),
    createdAt: faker.date.past(),
    updatedAt: faker.date.past(),
    role: faker.helpers.enumValue(UserRole),
    ...user,
  });
};

export const mockUsers = (
  length: number = 5,
  user: Partial<User> = {},
): User[] => {
  return Array.from({ length }, () => mockUser(user));
};

export const mockUserCreateDto = (
  createUserDto: Partial<CreateUserDto> = {},
): CreateUserDto => {
  return new CreateUserDto({
    email: faker.internet.email(),
    password: faker.internet.password(),
    name: faker.person.fullName(),
    role: faker.helpers.enumValue(UserRole),
    ...createUserDto,
  });
};

export const mockFindAvailableMentorsDto = (): FindAvailableMentorsDto => {
  return new FindAvailableMentorsDto({
    startDateTime: faker.date.future(),
  });
};

export const userRepositoryMock: () => MockType<Repository<User>> = jest.fn(
  () => ({
    find: jest.fn(() => mockUsers()),
    findOneBy: jest.fn(() => mockUser()),
    create: jest.fn((createUserDto) => mockUser(createUserDto)),
  }),
);

export const userServiceMock: () => MockType<UserService> = jest.fn(() => ({
  create: jest.fn((createUserDto) =>
    mockUser({
      ...createUserDto,
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
  ),
  findOneById: jest.fn((id: number) => mockUser({ id })),
  findOneByEmail: jest.fn((email) => mockUser({ email })),
  findAvailableMentors: jest.fn(() => [mockUser({ role: UserRole.Mentor })]),
}));
