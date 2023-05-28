import { ValidationPipe } from '@nestjs/common';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';

import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { PrismaClientExceptionFilter } from './prisma/prisma-client-exception.filter';
import { InternalExceptionFilter } from './common/internal-exception-filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.enableCors({
    credentials: true,
    origin: true,
  });

  const config = app.get(ConfigService);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  // Prisma filter
  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new PrismaClientExceptionFilter(httpAdapter));
  app.useGlobalFilters(new InternalExceptionFilter(httpAdapter));

  // Swagger
  const configSwagger = new DocumentBuilder()
    .addCookieAuth('token')
    .addBearerAuth()
    .setTitle('Voucher API')
    .setDescription('Voucher API for dashboard and client')
    .setVersion('0.1')
    .build();
  const document = SwaggerModule.createDocument(app, configSwagger);
  SwaggerModule.setup('api', app, document);
  await app.listen(config.get('port'));
}
bootstrap();
