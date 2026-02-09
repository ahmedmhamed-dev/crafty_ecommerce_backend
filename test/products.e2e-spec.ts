import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { v4 as uuidv4 } from 'uuid';

describe('Products Endpoints (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let categoryId: string;
  let productId: string;
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

    // Create vendor profile to get VENDOR role
    await request(app.getHttpServer())
      .post('/api/v1/vendors')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        storeName: 'Test Store',
        storeSlug: `test-store-${uuidv4()}`,
      });

    const categoryResponse = await request(app.getHttpServer())
      .post('/api/v1/categories')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: `Test Category ${uuidv4()}`,
        description: 'Test category description',
      });

    categoryId = categoryResponse.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/products (GET)', () => {
    it('should return all products', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/products')
        .expect(200);

      const isValid = response.body.data !== undefined || Array.isArray(response.body);
      expect(isValid).toBe(true);
    });
  });

  describe('/products (POST)', () => {
    it('should create a new product', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: `Test Product ${uuidv4()}`,
          slug: `test-product-${uuidv4()}`,
          description: 'Test product description',
          price: 99.99,
          categoryId: categoryId,
          quantity: 100,
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      productId = response.body.id;
    });
  });

  describe('/products/:id (GET)', () => {
    it('should return a product', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/products/${productId}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', productId);
    });
  });
});
