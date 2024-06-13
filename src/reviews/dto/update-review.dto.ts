import { PartialType } from '@nestjs/swagger';
import { CreateReviewDto } from './create-review.dto';
import { ReviewStatus } from '../types/reviewStatus';

export class UpdateReviewDto extends PartialType(CreateReviewDto) {
  status: ReviewStatus;
}
