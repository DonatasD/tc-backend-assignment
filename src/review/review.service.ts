import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { CreateReviewDto } from './dto/createReview.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { In, LessThan, MoreThan, Not, Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { ReviewStatus } from './types/reviewStatus';
import { addHours, isAfter, toDate } from 'date-fns';
import { UserService } from '../user/user.service';
import { UserRole } from '../user/types/userRole';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    private userService: UserService,
  ) {}

  async create(createReviewDto: CreateReviewDto) {
    const isValidToCreate = await this.isValidToCreate(createReviewDto);
    if (!isValidToCreate) {
      Logger.warn('Cannot create review it is conflicting with other review');
      throw new BadRequestException(
        'Cannot create review it is conflicting with other review',
      );
    }
    const endDateTime = addHours(createReviewDto.startDateTime, 1);
    return this.reviewRepository.save({ ...createReviewDto, endDateTime });
  }

  async findAll() {
    return this.reviewRepository.find();
  }

  async findAllByMentorId(mentorId: number) {
    return this.reviewRepository.findBy({ mentorId });
  }

  async findAllByStudentId(studentId: number) {
    return this.reviewRepository.findBy({ studentId });
  }

  async findAllByUserId(userId: number) {
    return this.reviewRepository.find({
      where: [
        {
          mentorId: userId,
        },
        {
          studentId: userId,
        },
      ],
    });
  }

  async updateReviewStatus(
    id: number,
    {
      status,
      grade,
      comment,
    }: { status: ReviewStatus; grade?: number; comment?: string },
  ) {
    const review = await this.reviewRepository.findOneBy({ id });
    if (!this.isValidStatusTransition(review.status, status)) {
      Logger.error(`Unable to transition from ${review.status} to ${status}`);
      throw new BadRequestException(
        `Unable to transition from ${review.status} to ${status}`,
      );
    }

    if (
      status === ReviewStatus.InProgress &&
      !isAfter(review.startDateTime, new Date())
    ) {
      Logger.error('Unable to start review. Too early');
      throw new BadRequestException('Unable to start review. Too early');
    }
    const update = {
      ...(grade && { grade }),
      ...(comment && { comment }),
      ...(status && { status }),
    };

    return this.reviewRepository.save({ ...review, ...update });
  }

  private isValidStatusTransition(
    currentStatus: ReviewStatus,
    newStatus: ReviewStatus,
  ) {
    const validTransitions = [
      [ReviewStatus.Scheduled, ReviewStatus.Cancelled],
      [ReviewStatus.Scheduled, ReviewStatus.InProgress],
      [ReviewStatus.InProgress, ReviewStatus.Complete],
    ];
    return validTransitions.some(
      (transition) =>
        transition[0] === currentStatus && transition[1] === newStatus,
    );
  }

  async isValidToCreate(createReviewDto: CreateReviewDto) {
    const isValidMentor =
      (await this.userService.findOneById(createReviewDto.mentorId))?.role ===
      UserRole.Mentor;
    if (!isValidMentor) {
      Logger.error('Invalid Mentor');
      throw new BadRequestException('Invalid Mentor');
    }
    const isValidStudent =
      (await this.userService.findOneById(createReviewDto.studentId))?.role ===
      UserRole.Student;

    if (!isValidStudent) {
      Logger.error('Invalid Student');
      throw new BadRequestException('Invalid Student');
    }

    const startRange = toDate(createReviewDto.startDateTime);
    const endRange = addHours(startRange, 1);

    const conflictingReview = await this.reviewRepository.find({
      where: [
        {
          startDateTime: LessThan(endRange),
          endDateTime: MoreThan(startRange),
          mentorId: createReviewDto.mentorId,
          status: Not(In([ReviewStatus.Cancelled])),
        },
        {
          startDateTime: LessThan(endRange),
          endDateTime: MoreThan(startRange),
          studentId: createReviewDto.studentId,
          status: Not(In([ReviewStatus.Cancelled])),
        },
      ],
    });
    Logger.debug(
      `Review creation conflicts with: ${conflictingReview.map((review) => review.id)}`,
    );

    return conflictingReview.length === 0;
  }
}
