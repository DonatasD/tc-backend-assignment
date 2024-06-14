import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { getEnvironment } from '../utils/environment';

export interface AppConfig {
  database: TypeOrmModuleOptions;
  version: string;
  environment: string;
  auth: {
    jwtSecret: string;
  };
  seed: {
    userEnabled: boolean;
    reviewEnabled: boolean;
  };
}

const appConfig = (): AppConfig => ({
  database: {
    type: 'postgres',
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    port: +process.env.DB_PORT,
    synchronize: true,
    autoLoadEntities: true,
    entities: ['dist/**/*.entity{.ts,.js}'],
    schema: process.env.DB_SCHEMA,
    keepConnectionAlive: true,
  },
  version: process.env.VERSION,
  environment: getEnvironment(),
  auth: {
    jwtSecret: process.env.AUTH_JWT_SECRET,
  },
  seed: {
    userEnabled: !!+process.env.SEED_USERS_ENABLED,
    reviewEnabled: !!+process.env.SEED_REVIEWS_ENABLED,
  },
});

export default appConfig;
