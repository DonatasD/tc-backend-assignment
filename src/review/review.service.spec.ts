import { Test, TestingModule } from '@nestjs/testing';
import { ReviewService } from './review.service';
import { mockUser, userServiceMock } from '../user/mock/user.mock';

import { getRepositoryToken } from '@nestjs/typeorm';
import { Review } from './entities/review.entity';
import { UserService } from '../user/user.service';
import { Repository } from 'typeorm';
import { MockType } from '../utils/mock.types';
import {
  mockReview,
  mockReviewCreateDto,
  mockReviews,
  reviewRepositoryMock,
} from './mock/review.mock';
import { faker } from '@faker-js/faker';
import { ReviewStatus } from './types/reviewStatus';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { UserRole } from '../user/types/userRole';

describe('ReviewService', () => {
  let reviewService: ReviewService;
  let reviewRepository: MockType<Repository<Review>>;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewService,
        { provide: UserService, useFactory: userServiceMock },
        {
          provide: getRepositoryToken(Review),
          useFactory: reviewRepositoryMock,
        },
      ],
    }).compile();

    reviewService = module.get<ReviewService>(ReviewService);
    reviewRepository = module.get(getRepositoryToken(Review));
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(reviewService).toBeDefined();
    expect(reviewRepository).toBeDefined();
    expect(userService).toBeDefined();
  });

  describe('create', () => {
    it('Should successfully create review', async () => {
      const createDto = mockReviewCreateDto();
      jest
        .spyOn(reviewService, 'isValidToCreate')
        .mockImplementation(() => Promise.resolve(true));
      const result = await reviewService.create(createDto);
      expect(reviewService.isValidToCreate).toHaveBeenCalled();
      expect(reviewRepository.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('Should throw error if is invalid to create', async () => {
      const createDto = mockReviewCreateDto();
      jest
        .spyOn(reviewService, 'isValidToCreate')
        .mockImplementation(() => Promise.resolve(false));
      await expect(reviewService.create(createDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(reviewService.isValidToCreate).toHaveBeenCalled();
    });
  });

  describe('findAll()', () => {
    it('Should return all reviews', async () => {
      const expected = mockReviews();
      reviewRepository.find.mockReturnValue(expected);
      const result = await reviewService.findAll();
      expect(reviewRepository.find).toHaveBeenCalled();
      expect(result).toEqual(expected);
    });
  });

  describe('findByMentorId()', () => {
    it('Should return review by mentorId', async () => {
      const expected = mockReview();
      reviewRepository.findBy.mockReturnValue(expected);
      const result = await reviewService.findByMentorId(expected.mentorId);
      expect(reviewRepository.findBy).toHaveBeenCalled();
      expect(result).toEqual(expected);
    });
  });

  describe('findByStudentId()', () => {
    it('Should successfully review by studentId', async () => {
      const expected = mockReview();
      reviewRepository.findBy.mockReturnValue(expected);
      const result = await reviewService.findByStudentId(expected.studentId);
      expect(reviewRepository.findBy).toHaveBeenCalled();
      expect(result).toEqual(expected);
    });
  });

  describe('findByUserId()', () => {
    it('Should successfully find mentor reviews by userId', async () => {
      const userId = faker.number.int();
      const expected = mockReviews(5, { mentorId: userId });
      reviewRepository.find.mockReturnValue(expected);
      const result = await reviewService.findByUserId(userId);
      expect(reviewRepository.find).toHaveBeenCalled();
      expect(result).toEqual(expected);
    });

    it('Should successfully find student reviews by userId', async () => {
      const userId = faker.number.int();
      const expected = mockReviews(5, { studentId: userId });
      reviewRepository.find.mockReturnValue(expected);
      const result = await reviewService.findByUserId(userId);
      expect(reviewRepository.find).toHaveBeenCalled();
      expect(result).toEqual(expected);
    });
  });

  describe('updateReviewStatus()', () => {
    it('Should successfully update review status from scheduled to in_progress, when startDateTime is in the past', async () => {
      const reviewBeingUpdated = mockReview({
        status: ReviewStatus.Scheduled,
        startDateTime: faker.date.past(),
      });
      reviewRepository.findOneBy.mockReturnValue(reviewBeingUpdated);
      const result = await reviewService.updateReviewStatus(
        reviewBeingUpdated.id,
        reviewBeingUpdated.mentorId,
        {
          status: ReviewStatus.InProgress,
        },
      );
      expect(reviewRepository.findOneBy).toHaveBeenCalled();
      expect(reviewRepository.save).toHaveBeenCalled();
      expect(result.status).toEqual(ReviewStatus.InProgress);
    });

    it('Should successfully update review status from scheduled to cancelled', async () => {
      const reviewBeingUpdated = mockReview({ status: ReviewStatus.Scheduled });
      reviewRepository.findOneBy.mockReturnValue(reviewBeingUpdated);
      const result = await reviewService.updateReviewStatus(
        reviewBeingUpdated.id,
        reviewBeingUpdated.studentId,
        {
          status: ReviewStatus.Cancelled,
        },
      );
      expect(reviewRepository.findOneBy).toHaveBeenCalled();
      expect(reviewRepository.save).toHaveBeenCalled();
      expect(result.status).toEqual(ReviewStatus.Cancelled);
    });

    it('Should successfully update review status from in_progress to complete', async () => {
      const reviewBeingUpdated = mockReview({
        status: ReviewStatus.InProgress,
      });
      reviewRepository.findOneBy.mockReturnValue(reviewBeingUpdated);
      const result = await reviewService.updateReviewStatus(
        reviewBeingUpdated.id,
        reviewBeingUpdated.mentorId,
        {
          status: ReviewStatus.Complete,
        },
      );
      expect(reviewRepository.findOneBy).toHaveBeenCalled();
      expect(reviewRepository.save).toHaveBeenCalled();
      expect(result.status).toEqual(ReviewStatus.Complete);
    });

    it('Should fail update review status from in_progress to cancelled', async () => {
      const reviewBeingUpdated = mockReview({
        status: ReviewStatus.InProgress,
      });
      reviewRepository.findOneBy.mockReturnValue(reviewBeingUpdated);
      await expect(
        reviewService.updateReviewStatus(
          reviewBeingUpdated.id,
          reviewBeingUpdated.mentorId,
          {
            status: ReviewStatus.Cancelled,
          },
        ),
      ).rejects.toThrow(BadRequestException);
      expect(reviewRepository.findOneBy).toHaveBeenCalled();
    });

    it('Should fail update review status from scheduled to complete', async () => {
      const reviewBeingUpdated = mockReview({
        status: ReviewStatus.Scheduled,
      });
      reviewRepository.findOneBy.mockReturnValue(reviewBeingUpdated);
      await expect(
        reviewService.updateReviewStatus(
          reviewBeingUpdated.id,
          reviewBeingUpdated.mentorId,
          {
            status: ReviewStatus.Complete,
          },
        ),
      ).rejects.toThrow(BadRequestException);
      expect(reviewRepository.findOneBy).toHaveBeenCalled();
    });

    it('Should fail update review status from scheduled to in_progress, when startDateTime is in future', async () => {
      const reviewBeingUpdated = mockReview({
        status: ReviewStatus.Scheduled,
        startDateTime: faker.date.future(),
      });
      reviewRepository.findOneBy.mockReturnValue(reviewBeingUpdated);
      await expect(
        reviewService.updateReviewStatus(
          reviewBeingUpdated.id,
          reviewBeingUpdated.mentorId,
          {
            status: ReviewStatus.InProgress,
          },
        ),
      ).rejects.toThrow(BadRequestException);
      expect(reviewRepository.findOneBy).toHaveBeenCalled();
    });

    it('Should throw error when user updating review is not a participant', async () => {
      const reviewBeingUpdated = mockReview({
        status: ReviewStatus.Scheduled,
        startDateTime: faker.date.future(),
        mentorId: 1,
        studentId: 2,
      });
      reviewRepository.findOneBy.mockReturnValue(reviewBeingUpdated);
      await expect(
        reviewService.updateReviewStatus(reviewBeingUpdated.id, 3, {
          status: ReviewStatus.InProgress,
        }),
      ).rejects.toThrow(ForbiddenException);
      expect(reviewRepository.findOneBy).toHaveBeenCalled();
    });
  });

  describe('isValidToCreate()', () => {
    it('Return true if no conflicting reviews are found', async () => {
      const mentor = mockUser({ id: 1, role: UserRole.Mentor });
      const student = mockUser({ id: 2, role: UserRole.Student });
      const createDto = mockReviewCreateDto({
        mentorId: mentor.id,
        studentId: student.id,
      });
      jest.spyOn(userService, 'findOneById').mockImplementation((id) => {
        switch (id) {
          case mentor.id:
            return Promise.resolve(mentor);
          case student.id:
            return Promise.resolve(student);
          default:
            throw Error('Unexpected test case');
        }
      });
      reviewRepository.find.mockReturnValue([]);
      const result = await reviewService.isValidToCreate(createDto);
      expect(userService.findOneById).toHaveBeenCalled();
      expect(reviewRepository.find).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('Return false if conflicting reviews are found', async () => {
      const mentor = mockUser({ id: 1, role: UserRole.Mentor });
      const student = mockUser({ id: 2, role: UserRole.Student });
      const createDto = mockReviewCreateDto({
        mentorId: mentor.id,
        studentId: student.id,
      });
      jest.spyOn(userService, 'findOneById').mockImplementation((id) => {
        switch (id) {
          case mentor.id:
            return Promise.resolve(mentor);
          case student.id:
            return Promise.resolve(student);
          default:
            throw Error('Unexpected test case');
        }
      });
      reviewRepository.find.mockReturnValue(mockReviews());
      const result = await reviewService.isValidToCreate(createDto);
      expect(userService.findOneById).toHaveBeenCalled();
      expect(reviewRepository.find).toHaveBeenCalled();
      expect(result).toBe(false);
    });

    it('Throw if invalid mentorId is provided', async () => {
      // Provided Admin as Mentor
      const mentor = mockUser({ id: 1, role: UserRole.Admin });
      const student = mockUser({ id: 2, role: UserRole.Student });
      const createDto = mockReviewCreateDto({
        mentorId: mentor.id,
        studentId: student.id,
      });
      jest.spyOn(userService, 'findOneById').mockImplementation((id) => {
        switch (id) {
          case mentor.id:
            return Promise.resolve(mentor);
          case student.id:
            return Promise.resolve(student);
          default:
            throw Error('Unexpected test case');
        }
      });
      reviewRepository.find.mockReturnValue(mockReviews());
      await expect(reviewService.isValidToCreate(createDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(userService.findOneById).toHaveBeenCalled();
    });

    it('Throw if invalid studentId is provided', async () => {
      const mentor = mockUser({ id: 1, role: UserRole.Mentor });
      // Provided Mentor as Student
      const student = mockUser({ id: 2, role: UserRole.Mentor });
      const createDto = mockReviewCreateDto({
        mentorId: mentor.id,
        studentId: student.id,
      });
      jest.spyOn(userService, 'findOneById').mockImplementation((id) => {
        switch (id) {
          case mentor.id:
            return Promise.resolve(mentor);
          case student.id:
            return Promise.resolve(student);
          default:
            throw Error('Unexpected test case');
        }
      });
      reviewRepository.find.mockReturnValue(mockReviews());
      await expect(reviewService.isValidToCreate(createDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(userService.findOneById).toHaveBeenCalled();
    });
  });
});
