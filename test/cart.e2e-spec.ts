import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { v4 as uuidv4 } from 'uuid';

describe('Cart Endpoints (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let productId: string;
  let categoryId: string;
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

  describe('/cart (GET)', () => {
    it('should return user cart', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/cart')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.status).toBe(200);
    });
  });

  describe('/cart (POST)', () => {
    it('should add item to cart', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/cart')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          productId: productId,
          quantity: 2,
        })
        .expect(201);

      expect(response.body).toHaveProperty('productId', productId);
      expect(response.body).toHaveProperty('quantity', 2);
    });
  });

  describe('/cart/:productId (PUT)', () => {
    it('should update cart item quantity', async () => {
      const response = await request(app.getHttpServer())
        .put(`/api/v1/cart/${productId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          quantity: 5,
        })
        .expect(200);

      expect(response.body).toHaveProperty('quantity', 5);
    });
  });

  describe('/cart/:productId (DELETE)', () => {
    it('should remove item from cart', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/api/v1/cart/${productId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      const isValid = response.body.productId !== undefined || response.body.success === true;
      expect(isValid).toBe(true);
    });
  });
});
