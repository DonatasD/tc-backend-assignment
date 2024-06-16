import { Injectable, Logger } from '@nestjs/common';
import { CreateUserDto } from '../user/dto/createUser.dto';
import { UserRole } from '../user/types/userRole';
import { AppConfig } from '../config/appConfig';
import { InjectRepository } from '@nestjs/typeorm';
import { Review } from '../review/entities/review.entity';
import { DeepPartial, Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import {
  addDays,
  roundToNearestHours,
  roundToNearestMinutes,
  set,
  subDays,
} from 'date-fns';
import { CreateReviewDto } from '../review/dto/createReview.dto';
import { ReviewService } from '../review/review.service';
import { ReviewStatus } from '../review/types/reviewStatus';
import * as bcrypt from 'bcryptjs';

const ADMIN_COUNT = 2;
const MENTOR_COUNT = 3;
const STUDENT_COUNT = 6;

@Injectable()
export class SeederService {
  constructor(
    private reviewService: ReviewService,
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async seed({ userEnabled, reviewEnabled }: AppConfig['seed']) {
    if (userEnabled) {
      await this.seedUser();
    }
    if (reviewEnabled) {
      await this.seedReview();
    }
  }

  private async seedUser() {
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

    return await this.bulkCreateUser([...students, ...admins, ...mentors]);
  }

  private async bulkCreateUser(user: CreateUserDto[]) {
    try {
      const userToSave: DeepPartial<User>[] = await Promise.all(
        user.map(async (user) => ({
          ...user,
          password: await bcrypt.hash(user.password, 10),
        })),
      );
      return this.userRepository.save(userToSave);
    } catch (e) {
      Logger.error('Failed to create user', e);
    }
  }

  private async seedReview() {
    const mentors = await this.userRepository.findBy({
      role: UserRole.Mentor,
    });
    const students = await this.userRepository.findBy({
      role: UserRole.Student,
    });

    if (mentors.length < MENTOR_COUNT || students.length < STUDENT_COUNT) {
      Logger.error(
        `Please setup atleast ${MENTOR_COUNT} mentors and ${STUDENT_COUNT} students to seed review`,
      );
      throw new Error(
        `Please setup atleast ${MENTOR_COUNT} mentors and ${STUDENT_COUNT} students to seed review`,
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

    const futureReview: CreateReviewDto[] = mentors
      .map((mentor, mentorIndex) => {
        return futureSlots.map((slot, slotIndex) => ({
          studentId:
            students[(mentorIndex * 2 + (slotIndex % 2)) % STUDENT_COUNT].id,
          mentorId: mentor.id,
          startDateTime: slot,
        }));
      })
      .flat();

    const pastReview: (CreateReviewDto & {
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

    const futureReviewCreated = await this.bulkCreateReview(futureReview);
    const pastReviewCreated = await this.reviewRepository.save(pastReview);
    return [...futureReviewCreated, ...pastReviewCreated];
  }

  private async bulkCreateReview(review: CreateReviewDto[]) {
    try {
      const areParticipantsAvailableForReview = await Promise.all(
        review.map(async (review) => {
          return this.reviewService.isValidToCreate(review);
        }),
      );
      if (areParticipantsAvailableForReview.some((value) => !value)) {
        throw new Error(
          'Cannot create review it is conflicting with other review',
        );
      }
      return this.reviewRepository.save(review);
    } catch (e) {
      Logger.error('Failed to create review', e);
      throw e;
    }
  }
}
