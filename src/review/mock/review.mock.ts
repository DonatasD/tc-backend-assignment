import { Review } from '../entities/review.entity';
import { faker } from '@faker-js/faker';
import { Repository } from 'typeorm';
import { ReviewService } from '../review.service';
import { MockType } from '../../utils/mock.types';
import { CreateReviewDto } from '../dto/createReview.dto';
import { addHours } from 'date-fns';
import { ReviewStatus } from '../types/reviewStatus';
import { CompleteReviewDto } from '../dto/completeReview.dto';

export const mockReview = (review: Partial<Review> = {}): Review => {
  const startDateTime = faker.date.anytime();
  return new Review({
    id: faker.number.int(),
    startDateTime: startDateTime,
    studentId: faker.number.int(),
    endDateTime: addHours(startDateTime, 1),
    mentorId: faker.number.int(),
    status: faker.helpers.enumValue(ReviewStatus),
    grade: faker.number.int({ min: 1, max: 10 }),
    comment: faker.lorem.text(),
    ...review,
  });
};

export const mockReviews = (
  length: number = 5,
  review: Partial<Review> = {},
): Review[] => {
  return Array.from({ length }, () => mockReview(review));
};

export const mockReviewCreateDto = (
  createReviewDto: Partial<CreateReviewDto> = {},
): CreateReviewDto => {
  return new CreateReviewDto({
    studentId: faker.number.int(),
    mentorId: faker.number.int(),
    startDateTime: faker.date.anytime(),
    ...createReviewDto,
  });
};

export const mockCompleteReviewDto = (): CompleteReviewDto => {
  return new CompleteReviewDto({
    comment: faker.lorem.text(),
    grade: faker.number.int({ min: 1, max: 10 }),
  });
};

export const reviewRepositoryMock: () => MockType<Repository<Review>> = jest.fn(
  () => ({
    find: jest.fn(() => mockReviews()),
    findBy: jest.fn((review) => mockReviews(review)),
    findOneBy: jest.fn(() => mockReview()),
    save: jest.fn((review) => mockReview(review)),
  }),
);

export const reviewServiceMock: () => MockType<ReviewService> = jest.fn(() => ({
  create: jest.fn((createReviewDto) =>
    mockReview({
      ...createReviewDto,
      status: ReviewStatus.Scheduled,
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
  ),
  findAll: jest.fn(() => mockReviews()),
  findByMentorId: jest.fn((mentorId) => mockReviews(5, { mentorId })),
  findByStudentId: jest.fn((studentId) => mockReviews(5, { studentId })),
  findByUserId: jest.fn((userId) => [
    mockReview({ studentId: userId }),
    mockReview({ mentorId: userId }),
  ]),
  updateReviewStatus: jest.fn((id, { status, grade, comment }) =>
    mockReview({ id, status, grade, comment }),
  ),
  isValidStatusTransition: jest.fn(() => true),
  isValidToCreate: jest.fn(() => true),
}));
