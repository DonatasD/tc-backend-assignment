import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  mockFindAvailableMentorsDto,
  mockUser,
  mockUsers,
  userRepositoryMock,
} from './mock/user.mock';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { MockType } from '../utils/mock.types';
import { UserRole } from './types/userRole';

describe('UserService', () => {
  let service: UserService;
  let repository: MockType<Repository<User>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useFactory: userRepositoryMock,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repository = module.get(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(repository).toBeDefined();
  });

  describe('findOneById()', () => {
    it('Should successfully return by id', async () => {
      const expected = mockUser();
      repository.findOneBy.mockReturnValue(expected);
      const result = await service.findOneById(expected.id);
      expect(repository.findOneBy).toHaveBeenCalled();
      expect(result).toEqual(expected);
    });
  });

  describe('findOneByEmail()', () => {
    it('Should successfully return by email', async () => {
      const expected = mockUser();
      repository.findOneBy.mockReturnValue(expected);
      const result = await service.findOneByEmail(expected.email);
      expect(repository.findOneBy).toHaveBeenCalled();
      expect(result).toEqual(expected);
    });
  });

  describe('findAvailableMentors()', () => {
    it('Should successfully return available mentors', async () => {
      const expected = mockUsers(3, { role: UserRole.Mentor });
      const payload = mockFindAvailableMentorsDto();
      repository.find.mockReturnValue(expected);
      const result = await service.findAvailableMentors(payload);
      expect(repository.find).toHaveBeenCalled();
      expect(result).toEqual(expected);
    });
  });
});
