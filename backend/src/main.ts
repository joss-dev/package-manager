import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { ValidationPipe } from '@nestjs/common';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { AllExceptionsFilter } from './common/interceptors/all-exceptions.filter';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.use(cookieParser());

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
      .setTitle('Order Manager API')
      .setDescription('Sistema de gestión de pedidos con autenticación JWT')
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token',
          in: 'header',
        },
        'JWT-auth',
      )
      .addCookieAuth('access_token')
      .addTag('Auth', 'Autenticación de usuarios')
      .addTag('Products', 'Gestión de productos')
      .addTag('Customers', 'Gestión de clientes')
      .addTag('Orders', 'Gestión de pedidos')
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

void bootstrap();
