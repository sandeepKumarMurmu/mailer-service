import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Set global prefix for all routes
  app.setGlobalPrefix(process.env.API_PREFIX || 'api');

  // Enable CORS
  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strip unknown fields
      forbidNonWhitelisted: true, // throw error if unknown fields exist
      transform: true, // auto-transform types
    }),
  );

  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });

  // Read port from environment or default to 3000
  const port = process.env.PORT ? Number(process.env.PORT) : 3000;

  await app.listen(port);

  const logger = new Logger(bootstrap.name);
  logger.log(
    `Application running at: http://localhost:${port}/${process.env.API_PREFIX || 'api'}`,
  );
}

bootstrap();
