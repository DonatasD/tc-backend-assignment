import { Injectable, Logger } from '@nestjs/common';
import { CreateUserDto } from '../users/dto/createUser.dto';
import { UserRole } from '../users/types/userRole';
import { AppConfig } from '../config/appConfig';
import { InjectRepository } from '@nestjs/typeorm';
import { Review } from '../reviews/entities/review.entity';
import { DeepPartial, Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import {
  addDays,
  roundToNearestHours,
  roundToNearestMinutes,
  set,
  subDays,
} from 'date-fns';
import { CreateReviewDto } from '../reviews/dto/createReview.dto';
import { ReviewsService } from '../reviews/reviews.service';
import { ReviewStatus } from '../reviews/types/reviewStatus';
import * as bcrypt from 'bcrypt';

const ADMIN_COUNT = 2;
const MENTOR_COUNT = 3;
const STUDENT_COUNT = 6;

@Injectable()
export class SeederService {
  constructor(
    private reviewService: ReviewsService,
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async seed({ usersEnabled, reviewsEnabled }: AppConfig['seed']) {
    if (usersEnabled) {
      await this.seedUsers();
    }
    if (reviewsEnabled) {
      await this.seedReviews();
    }
  }

  private async seedUsers() {
    const students: CreateUserDto[] = Array.from(
      new Array(STUDENT_COUNT),
      (_, index) => ({
        password: 'password',
        email: `student${index}@test.com`,
        name: `student${index}`,
        role: UserRole.Student,
      }),
    );
    const admins: CreateUserDto[] = Array.from(
      new Array(ADMIN_COUNT),
      (_, index) => ({
        password: 'password',
        email: `admin${index}@test.com`,
        name: `admin${index}`,
        role: UserRole.Admin,
      }),
    );
    const mentors: CreateUserDto[] = Array.from(
      new Array(MENTOR_COUNT),
      (_, index) => ({
        password: 'password',
        email: `mentor${index}@test.com`,
        name: `mentor${index}`,
        role: UserRole.Mentor,
      }),
    );

    return await this.bulkCreateUsers([...students, ...admins, ...mentors]);
  }

  private async bulkCreateUsers(users: CreateUserDto[]) {
    try {
      const usersToSave: DeepPartial<User>[] = await Promise.all(
        users.map(async (user) => ({
          ...user,
          password: await bcrypt.hash(user.password, 10),
        })),
      );
      return this.userRepository.save(usersToSave);
    } catch (e) {
      Logger.error('Failed to create user', e);
    }
  }

  private async seedReviews() {
    const mentors = await this.userRepository.findBy({
      role: UserRole.Mentor,
    });
    const students = await this.userRepository.findBy({
      role: UserRole.Student,
    });

    if (mentors.length < MENTOR_COUNT || students.length < STUDENT_COUNT) {
      Logger.error(
        `Please setup atleast ${MENTOR_COUNT} mentors and ${STUDENT_COUNT} students to seed reviews`,
      );
      throw new Error(
        `Please setup atleast ${MENTOR_COUNT} mentors and ${STUDENT_COUNT} students to seed reviews`,
      );
    }

    const futureSlots = [
      roundToNearestMinutes(set(addDays(new Date(), 1), { hours: 7 }), {
        nearestTo: 30,
      }),
      roundToNearestHours(set(addDays(new Date(), 1), { hours: 9 })),
      roundToNearestMinutes(set(addDays(new Date(), 1), { hours: 11 }), {
        nearestTo: 30,
      }),
      roundToNearestHours(set(addDays(new Date(), 1), { hours: 13 })),
      roundToNearestMinutes(set(addDays(new Date(), 1), { hours: 15 }), {
        nearestTo: 30,
      }),
      roundToNearestHours(set(addDays(new Date(), 1), { hours: 17 })),
    ];

    const pastSlots = [
      roundToNearestMinutes(set(subDays(new Date(), 1), { hours: 7 }), {
        nearestTo: 30,
      }),
      roundToNearestHours(set(subDays(new Date(), 1), { hours: 9 })),
      roundToNearestMinutes(set(subDays(new Date(), 1), { hours: 11 }), {
        nearestTo: 30,
      }),
      roundToNearestHours(set(subDays(new Date(), 1), { hours: 13 })),
      roundToNearestMinutes(set(subDays(new Date(), 1), { hours: 15 }), {
        nearestTo: 30,
      }),
      roundToNearestHours(set(subDays(new Date(), 1), { hours: 17 })),
    ];

    const futureReviews: CreateReviewDto[] = mentors
      .map((mentor, mentorIndex) => {
        return futureSlots.map((slot, slotIndex) => ({
          studentId:
            students[(mentorIndex * 2 + (slotIndex % 2)) % STUDENT_COUNT].id,
          mentorId: mentor.id,
          startDateTime: slot,
        }));
      })
      .flat();

    const pastReviews: (CreateReviewDto & {
      grade: number;
      status: ReviewStatus;
    })[] = mentors
      .map((mentor, mentorIndex) => {
        return pastSlots.map((slot, slotIndex) => ({
          studentId:
            students[(mentorIndex * 2 + (slotIndex % 2)) % STUDENT_COUNT].id,
          mentorId: mentor.id,
          startDateTime: slot,
          grade: slotIndex % 2 === 0 ? 5 : null,
          status:
            slotIndex % 2 === 0
              ? ReviewStatus.Complete
              : ReviewStatus.Cancelled,
        }));
      })
      .flat();

    const futureReviewsCreated = await this.bulkCreateReviews(futureReviews);
    const pastReviewsCreated = await this.reviewRepository.save(pastReviews);
    return [...futureReviewsCreated, ...pastReviewsCreated];
  }

  private async bulkCreateReviews(reviews: CreateReviewDto[]) {
    try {
      const areParticipantsAvailableForReviews = await Promise.all(
        reviews.map(async (review) => {
          return this.reviewService.isValidToCreate(review);
        }),
      );
      if (areParticipantsAvailableForReviews.some((value) => !value)) {
        throw new Error(
          'Cannot create review it is conflicting with other review',
        );
      }
      return this.reviewRepository.save(reviews);
    } catch (e) {
      Logger.error('Failed to create reviews', e);
      throw e;
    }
  }
}
