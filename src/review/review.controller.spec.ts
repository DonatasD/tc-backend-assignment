import { Test, TestingModule } from '@nestjs/testing';
import { ReviewController } from './review.controller';
import { ReviewService } from './review.service';
import {
  mockCompleteReviewDto,
  mockReviewCreateDto,
  reviewServiceMock,
} from './mock/review.mock';
import { mockUser } from '../user/mock/user.mock';
import { AuthenticatedRequest } from '../auth/types/authenticatedRequest';
import { UserRole } from '../user/types/userRole';
import { faker } from '@faker-js/faker';

describe('ReviewController', () => {
  let controller: ReviewController;
  let service: ReviewService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReviewController],
      providers: [{ provide: ReviewService, useFactory: reviewServiceMock }],
    }).compile();

    controller = module.get<ReviewController>(ReviewController);
    service = module.get<ReviewService>(ReviewService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('create()', () => {
    it('should successfully create review', async () => {
      const payload = mockReviewCreateDto();
      const result = await controller.create(payload);
      expect(service.create).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('findAll()', () => {
    it('should successfully return reviews for Admin', async () => {
      const req: AuthenticatedRequest = {
        user: mockUser({ role: UserRole.Admin }),
      } as AuthenticatedRequest; // TODO use a library to mock request properly
      const result = await controller.findAll(req);
      expect(service.findAll).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should successfully return reviews for Student', async () => {
      const req: AuthenticatedRequest = {
        user: mockUser({ role: UserRole.Student }),
      } as AuthenticatedRequest; // TODO use a library to mock request properly
      const result = await controller.findAll(req);
      expect(service.findByStudentId).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should successfully return reviews for Mentor', async () => {
      const req: AuthenticatedRequest = {
        user: mockUser({ role: UserRole.Mentor }),
      } as AuthenticatedRequest; // TODO use a library to mock request properly
      const result = await controller.findAll(req);
      expect(service.findByMentorId).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('findAllByUserId()', () => {
    it('should successfully return reviews by user id', async () => {
      const result = await controller.findAllByUserId(faker.number.int());
      expect(service.findByUserId).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('cancel()', () => {
    it('should successfully cancel review', async () => {
      const req: AuthenticatedRequest = {
        user: mockUser({ role: UserRole.Student }),
      } as AuthenticatedRequest; // TODO use a library to mock request properly
      const result = await controller.cancel(faker.number.int(), req);
      expect(service.updateReviewStatus).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('complete()', () => {
    it('should successfully cancel review', async () => {
      const req: AuthenticatedRequest = {
        user: mockUser({ role: UserRole.Student }),
      } as AuthenticatedRequest; // TODO use a library to mock request properly
      const completeReviewDto = mockCompleteReviewDto();
      const result = await controller.complete(
        faker.number.int(),
        completeReviewDto,
        req,
      );
      expect(service.updateReviewStatus).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('start()', () => {
    it('should successfully cancel review', async () => {
      const req: AuthenticatedRequest = {
        user: mockUser({ role: UserRole.Student }),
      } as AuthenticatedRequest; // TODO use a library to mock request properly
      const result = await controller.start(faker.number.int(), req);
      expect(service.updateReviewStatus).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });
});
