import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import csurf from 'csurf';
import cookieParser from 'cookie-parser';
import { Request, Response, NextFunction } from 'express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security: Helmet for HTTP headers
  app.use(helmet());

  // Security: CSRF protection
  // Requires a secret (use environment variable in production)
  app.use(cookieParser());
  // CSRF middleware with cookie-based token
  const csrfMiddleware = csurf({ 
    cookie: { httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production' },
    ignoreMethods: ['GET', 'HEAD', 'OPTIONS'],
  });
  app.use((req: Request, res: Response, next: NextFunction) => {
    // Skip CSRF for auth endpoints
    if (req.path.startsWith('/api/v1/auth/login') || req.path.startsWith('/api/v1/auth/register') || req.path.startsWith('/docs')) {
      return next();
    }
    csrfMiddleware(req, res, next);
  });

  // Enable CORS
  app.enableCors({
    origin: process.env.NODE_ENV === 'development' ? '*' : process.env.FRONTEND_URL,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // API prefix
  app.setGlobalPrefix('api/v1');

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Crafty E-Commerce API')
    .setDescription('Multi-Vendor E-Commerce Backend API Documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management')
    .addTag('vendors', 'Vendor store management')
    .addTag('products', 'Product catalog')
    .addTag('categories', 'Category management')
    .addTag('cart', 'Shopping cart')
    .addTag('orders', 'Order management')
    .addTag('payments', 'Payment processing')
    .addTag('reviews', 'Product reviews')
    .addTag('wishlist', 'Wishlist management')
    .addTag('addresses', 'Address management')
    .addTag('admin', 'Admin dashboard')
    .addTag('health', 'Health check endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 Swagger documentation: http://localhost:${port}/docs`);
}

bootstrap();
