import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { v4 as uuidv4 } from 'uuid';

describe('Reviews Endpoints (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let productId: string;
  let categoryId: string;
  let reviewId: string;
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

    const productResponse = await request(app.getHttpServer())
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: `Test Product ${uuidv4()}`,
        slug: `test-product-${uuidv4()}`,
        description: 'Test product description',
        price: 99.99,
        categoryId: categoryId,
        quantity: 100,
      });

    productId = productResponse.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/reviews/product/:productId (GET)', () => {
    it('should return product reviews', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/reviews/product/${productId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('/reviews (POST)', () => {
    it('should create a review', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/reviews')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          productId: productId,
          rating: 5,
          title: 'Great product',
          comment: 'Excellent product!',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('rating', 5);
      reviewId = response.body.id;
    });
  });
});
