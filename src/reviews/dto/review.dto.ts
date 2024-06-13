import { ReviewStatus } from '../types/reviewStatus';

export class ReviewDto {
  id: number;

  grade: number | null;

  status: ReviewStatus;

  startDateTime: Date;

  studentId: number;

  mentorId: number;

  createdAt: Date;

  updatedAt: Date;
}
