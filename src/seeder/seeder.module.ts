import { Module } from '@nestjs/common';
import { SeederService } from './seeder.service';
import { UserModule } from '../user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from '../review/entities/review.entity';
import { User } from '../user/entities/user.entity';
import { ReviewModule } from '../review/review.module';

@Module({
  providers: [SeederService],
  imports: [
    UserModule,
    ReviewModule,
    TypeOrmModule.forFeature([User]),
    TypeOrmModule.forFeature([Review]),
  ],
  exports: [SeederService],
})
export class SeederModule {}
