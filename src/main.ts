import { NestApplication, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import appConfig from './config/appConfig';

const bootstrap = async () => {
  const app = await NestFactory.create(AppModule);
  const configService: ConfigService = app.get(ConfigService);

  app.setGlobalPrefix('api');

  const swaggerOptions = new DocumentBuilder()
    .setTitle('Turing College')
    .setDescription('API for user management')
    .setVersion(appConfig.version)
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerOptions);
  SwaggerModule.setup('swagger', app, swaggerDocument);

  await app.listen(configService.get('PORT'));
};
bootstrap()
  .then(() => {
    Logger.log('Bootstrap started successfully', NestApplication.name);
  })
  .catch((e) => Logger.error(e.stack, NestApplication.name));
