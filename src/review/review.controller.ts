import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Request,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/createReview.dto';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '../utils/roles.decorator';
import { AuthenticatedRequest } from '../auth/types/authenticatedRequest';
import { Review } from './entities/review.entity';
import { UserRole } from '../user/types/userRole';
import { ReviewStatus } from './types/reviewStatus';
import { CompleteReviewDto } from './dto/completeReview.dto';

@ApiTags('Review')
@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Roles(UserRole.Student)
  @Post()
  create(@Body() createReviewDto: CreateReviewDto) {
    return this.reviewService.create(createReviewDto);
  }

  @Get()
  @ApiOkResponse({
    description:
      'Successfully returns a list of all review available based on role',
    type: [Review],
  })
  findAll(@Request() req: AuthenticatedRequest) {
    const { user } = req;
    switch (req.user.role) {
      case UserRole.Admin: {
        return this.reviewService.findAll();
      }
      case UserRole.Student: {
        return this.reviewService.findByStudentId(user.id);
      }
      case UserRole.Mentor: {
        return this.reviewService.findByMentorId(user.id);
      }
    }
  }

  @Roles(UserRole.Admin)
  @Get('/users/:userId')
  findAllByUserId(@Param('userId') userId: number) {
    return this.reviewService.findByUserId(userId);
  }

  @Roles(UserRole.Mentor, UserRole.Student)
  @Patch(':id/cancel')
  cancel(@Param('id') id: number, @Request() req: AuthenticatedRequest) {
    return this.reviewService.updateReviewStatus(id, req.user.id, {
      status: ReviewStatus.Cancelled,
    });
  }

  @Roles(UserRole.Mentor)
  @Patch(':id/start')
  start(@Param('id') id: number, @Request() req: AuthenticatedRequest) {
    return this.reviewService.updateReviewStatus(id, req.user.id, {
      status: ReviewStatus.InProgress,
    });
  }

  @Roles(UserRole.Mentor)
  @Patch(':id/complete')
  complete(
    @Param('id') id: number,
    @Body() completeReviewDto: CompleteReviewDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.reviewService.updateReviewStatus(id, req.user.id, {
      status: ReviewStatus.Complete,
      ...completeReviewDto,
    });
  }
}
