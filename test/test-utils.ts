import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

export const createTestApp = async (): Promise<INestApplication> => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.setGlobalPrefix('api/v1');
  await app.init();
  return app;
};

export const registerAndLogin = async (
  app: INestApplication,
  prefix?: string,
): Promise<{ accessToken: string; userId: string; email: string }> => {
  const email = prefix
    ? `${prefix}.${Date.now()}@example.com`
    : `test.${Date.now()}@example.com`;

  // Register
  const registerResponse = await request(app.getHttpServer())
    .post('/api/v1/auth/register')
    .send({
      email,
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
    })
    .expect(201);

  expect(registerResponse.body).toHaveProperty('accessToken');
  expect(registerResponse.body).toHaveProperty('user');

  const accessToken = registerResponse.body.accessToken;
  const userId = registerResponse.body.user.id;

  return { accessToken, userId, email };
};

export const login = async (
  app: INestApplication,
  email: string,
): Promise<string> => {
  const response = await request(app.getHttpServer())
    .post('/api/v1/auth/login')
    .send({
      email,
      password: 'password123',
    })
    .expect(200);

  expect(response.body).toHaveProperty('accessToken');
  return response.body.accessToken;
};
