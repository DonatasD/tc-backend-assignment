import { Module } from '@nestjs/common';
import { SeederService } from './seeder.service';
import { UsersModule } from '../users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from '../reviews/entities/review.entity';
import { User } from '../users/entities/user.entity';
import { ReviewsModule } from '../reviews/reviews.module';

@Module({
  providers: [SeederService],
  imports: [
    UsersModule,
    ReviewsModule,
    TypeOrmModule.forFeature([User]),
    TypeOrmModule.forFeature([Review]),
  ],
  exports: [SeederService],
})
export class SeederModule {}
