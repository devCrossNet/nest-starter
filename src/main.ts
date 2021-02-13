require('dotenv').config();

import { NestFactory } from '@nestjs/core';
import * as helmet from 'helmet';
import * as compression from 'compression';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn'],
  });

  app.enableCors();

  app.use(helmet());
  app.use(compression());

  await app.listen(8080);
}
bootstrap();
