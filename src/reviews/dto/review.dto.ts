import { ReviewStatus } from '../types/reviewStatus';
import { ApiProperty } from '@nestjs/swagger';

export class ReviewDto {
  @ApiProperty()
  id: number;

  @ApiProperty({ nullable: true })
  grade: number | null;

  @ApiProperty()
  status: ReviewStatus;

  @ApiProperty()
  startDateTime: Date;

  @ApiProperty()
  studentId: number;

  @ApiProperty()
  mentorId: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
