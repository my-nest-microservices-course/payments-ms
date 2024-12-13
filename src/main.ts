import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { envs } from './config';

import * as dotenv from 'dotenv';
dotenv.config();
async function bootstrap() {
  const logger = new Logger('Payments-ms');
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  await app.listen(envs.port);
  logger.log(`Server is running on: ${envs.port}`);
  if (process.env.NODE_ENV === 'development') {
    logger.warn(
      `DEV MODE. Remember to up hookdeck. If needed instructions go to README.md `,
    );
  }
}
bootstrap();
