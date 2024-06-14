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
@Controller('review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Roles(UserRole.Mentor, UserRole.Student)
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
        return this.reviewService.findAllByStudentId(user.id);
      }
      case UserRole.Mentor: {
        return this.reviewService.findAllByMentorId(user.id);
      }
    }
  }

  @Roles(UserRole.Admin)
  @Get('/user/:userId')
  findAllByUserId(@Param('userId') userId: number) {
    return this.reviewService.findAllByUserId(userId);
  }

  @Roles(UserRole.Mentor, UserRole.Student)
  @Patch(':id/cancel')
  cancel(@Param('id') id: number) {
    return this.reviewService.updateReviewStatus(id, {
      status: ReviewStatus.Cancelled,
    });
  }

  @Roles(UserRole.Mentor)
  @Patch(':id/start')
  start(@Param('id') id: number) {
    return this.reviewService.updateReviewStatus(id, {
      status: ReviewStatus.InProgress,
    });
  }

  @Roles(UserRole.Mentor)
  @Patch(':id/complete')
  complete(
    @Param('id') id: number,
    @Body() completeReviewDto: CompleteReviewDto,
  ) {
    return this.reviewService.updateReviewStatus(id, {
      status: ReviewStatus.Complete,
      ...completeReviewDto,
    });
  }
}
