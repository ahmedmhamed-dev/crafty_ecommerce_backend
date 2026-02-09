import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { v4 as uuidv4 } from 'uuid';

describe('Vendors Endpoints (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let userId: string;
  const testEmail = `test.${uuidv4()}@example.com`;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.setGlobalPrefix('api/v1');
    await app.init();

    const registerResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: testEmail,
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      });

    accessToken = registerResponse.body.accessToken;
    userId = registerResponse.body.user.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/vendors (GET)', () => {
    it('should return all vendors', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/vendors')
        .expect(200);

      const isValid = response.body.data !== undefined || Array.isArray(response.body);
      expect(isValid).toBe(true);
    });
  });

  describe('/vendors (POST)', () => {
    it('should create a vendor profile', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/vendors')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          storeName: 'Test Store',
          storeSlug: `test-store-${uuidv4()}`,
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('userId', userId);
    });
  });

  describe('/vendors/my-profile (GET)', () => {
    it('should return vendor profile', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/vendors/my-profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.status).toBe(200);
    });
  });
});
