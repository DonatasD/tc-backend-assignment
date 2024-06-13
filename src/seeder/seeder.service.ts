import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { ReviewsService } from '../reviews/reviews.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UserRole } from '../users/types/userRole';

@Injectable()
export class SeederService {
  constructor(
    private userService: UsersService,
    private reviewsService: ReviewsService,
  ) {}

  async seed() {
    const users = await this.seedUsers();
    return users;
  }

  private async seedUsers() {
    const students: CreateUserDto[] = Array.from(new Array(5), (_, index) => ({
      password: 'password',
      email: `student${index}@test.com`,
      name: `student${index}`,
      role: UserRole.Student,
    }));
    const admins: CreateUserDto[] = Array.from(new Array(2), (_, index) => ({
      password: 'password',
      email: `admin${index}@test.com`,
      name: `admin${index}`,
      role: UserRole.Admin,
    }));
    const mentors: CreateUserDto[] = Array.from(new Array(3), (_, index) => ({
      password: 'password',
      email: `mentor${index}@test.com`,
      name: `mentor${index}`,
      role: UserRole.Mentor,
    }));

    return await this.userService.bulkCreate([
      ...students,
      ...admins,
      ...mentors,
    ]);
  }

  private async seedReviews() {}
}
