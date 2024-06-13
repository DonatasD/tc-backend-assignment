import { Module } from '@nestjs/common';
import { SeederService } from './seeder.service';
import { UsersModule } from '../users/users.module';
import { ReviewsModule } from '../reviews/reviews.module';

@Module({
  providers: [SeederService],
  imports: [UsersModule, ReviewsModule],
  exports: [SeederService],
})
export class SeederModule {}
