import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import * as dotenv from 'dotenv';
import { AppModule } from './app.module';
import { envs } from './config';
dotenv.config();

//TODO add to submodule launcher repository.

async function bootstrap() {
  const logger = new Logger('Payments-ms');
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.connectMicroservice<MicroserviceOptions>(
    {
      transport: Transport.NATS,
      options: {
        servers: envs.natsServers,
      },
    },
    {
      inheritAppConfig: true,
    },
  );
  await app.startAllMicroservices();
  await app.listen(envs.port);
  logger.log(`Server is running on: ${envs.port}`);
  logger.warn(`process.env.NODE_ENV: ${process.env.NODE_ENV}`);
  if (process.env.NODE_ENV === 'development') {
    logger.warn(
      `DEV MODE. Remember to up hookdeck. If needed instructions go to README.md `,
    );
  }
}
bootstrap();
