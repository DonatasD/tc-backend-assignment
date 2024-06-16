import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import {
  mockFindAvailableMentorsDto,
  mockUserCreateDto,
  userServiceMock,
} from './mock/user.mock';

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ provide: UserService, useFactory: userServiceMock }],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('create()', () => {
    it('should successfully create user', async () => {
      const payload = mockUserCreateDto();
      const result = await controller.create(payload);
      expect(service.create).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });
  describe('findAvailableMentors()', () => {
    it('should successfully return available mentors', async () => {
      const payload = mockFindAvailableMentorsDto();
      const result = await controller.findAvailableMentors(payload);
      expect(service.findAvailableMentors).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });
});
