import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './health/health.module';
import { getEnvFilePaths } from './utils/environment';
import { UsersModule } from './users/users.module';
import { ReviewsModule } from './reviews/reviews.module';
import { AuthModule } from './auth/auth.module';
import databaseConfig from './config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
      envFilePath: getEnvFilePaths(),
    }),
    TypeOrmModule.forRoot(databaseConfig()),
    HealthModule,
    UsersModule,
    ReviewsModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
