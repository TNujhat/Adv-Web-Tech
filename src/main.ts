


import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';

// Load environment variables before anything else
dotenv.config();

console.log('JWT_SECRET:', process.env.JWT_SECRET); // Log the value of the JWT_SECRET

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.listen(3000);
  console.log('App running on http://localhost:3000');
}

bootstrap();
