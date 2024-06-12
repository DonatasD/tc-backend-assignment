import { PartialType } from '@nestjs/swagger';
import { CreateReviewDto } from './create-review.dto';
import { ReviewStatus } from '../entities/review.entity';

export class UpdateReviewDto extends PartialType(CreateReviewDto) {
  status: ReviewStatus;
}
