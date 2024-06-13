import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '../utils/roles.decorator';
import { AuthenticatedRequest } from '../auth/types/authenticatedRequest';
import { Review } from './entities/review.entity';
import { UserRole } from '../users/types/userRole';

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
  findOne(@Param('userId') userId: number) {
    return this.reviewsService.findAllByUserId(userId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateReviewDto: UpdateReviewDto) {
    return this.reviewsService.update(+id, updateReviewDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reviewsService.remove(+id);
  }
}
