import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { ValidationPipe } from '@nestjs/common';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { AllExceptionsFilter } from './common/interceptors/all-exceptions.filter';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const mode = configService.get<string>('MODE') || 'development';
  const port = configService.get<number>('PORT') || 3000;
  const frontendUrl = configService.get<string>('FRONTEND_URL');

  app.use(helmet());
  app.enableCors({
    origin: frontendUrl,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter());

  if (mode === 'development') {
    const config = new DocumentBuilder()
      .setTitle('Product API')
      .setDescription('API profesional con configuración por entorno')
      .setVersion('1.0')
      .addTag('Products')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);
  }

  await app.listen(port);
  console.log(`🚀 Server running in ${mode.toUpperCase()} mode`);
  console.log(`📡 Listening on: http://localhost:${port}`);
  if (mode === 'development')
    console.log(`📘 Swagger: http://localhost:${port}/docs`);
}

bootstrap();
