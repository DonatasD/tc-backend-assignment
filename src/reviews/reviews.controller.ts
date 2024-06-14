import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Request,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/createReview.dto';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '../utils/roles.decorator';
import { AuthenticatedRequest } from '../auth/types/authenticatedRequest';
import { Review } from './entities/review.entity';
import { UserRole } from '../users/types/userRole';
import { ReviewStatus } from './types/reviewStatus';
import { CompleteReviewDto } from './dto/completeReview.dto';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Roles(UserRole.Mentor, UserRole.Student)
  @Post()
  create(@Body() createReviewDto: CreateReviewDto) {
    return this.reviewsService.create(createReviewDto);
  }

  @Get()
  @ApiOkResponse({
    description:
      'Successfully returns a list of all reviews available based on role',
    type: [Review],
  })
  findAll(@Request() req: AuthenticatedRequest) {
    const { user } = req;
    switch (req.user.role) {
      case UserRole.Admin: {
        return this.reviewsService.findAll();
      }
      case UserRole.Student: {
        return this.reviewsService.findAllByStudentId(user.id);
      }
      case UserRole.Mentor: {
        return this.reviewsService.findAllByMentorId(user.id);
      }
    }
  }

  @Roles(UserRole.Admin)
  @Get('/users/:userId')
  findAllByUserId(@Param('userId') userId: number) {
    return this.reviewsService.findAllByUserId(userId);
  }

  @Roles(UserRole.Mentor, UserRole.Student)
  @Patch(':id/cancel')
  cancel(@Param('id') id: number) {
    return this.reviewsService.updateReviewStatus(id, {
      status: ReviewStatus.Cancelled,
    });
  }

  @Roles(UserRole.Mentor)
  @Patch(':id/start')
  start(@Param('id') id: number) {
    return this.reviewsService.updateReviewStatus(id, {
      status: ReviewStatus.InProgress,
    });
  }

  @Roles(UserRole.Mentor)
  @Patch(':id/complete')
  complete(
    @Param('id') id: number,
    @Body() completeReviewDto: CompleteReviewDto,
  ) {
    return this.reviewsService.updateReviewStatus(id, {
      status: ReviewStatus.Complete,
      ...completeReviewDto,
    });
  }
}
