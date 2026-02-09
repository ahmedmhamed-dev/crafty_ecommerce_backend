# Crafty E-Commerce Backend

A comprehensive multi-vendor e-commerce backend API built with NestJS, PostgreSQL, and Prisma ORM.

## 🚀 Features

### Core E-Commerce
- **Multi-Vendor Support** - Multiple vendors can register, manage products, and process orders
- **JWT Authentication** - Secure authentication with role-based access control
- **Product Management** - Full CRUD operations with image gallery support
- **Category System** - Hierarchical categories for products
- **Shopping Cart** - Complete cart management with variation support
- **Order Processing** - Order creation, tracking, and status updates
- **Payment Tracking** - Payment status tracking
- **Product Reviews** - Rating and review system
- **Wishlist** - Users can save products to wishlist
- **Address Management** - Multiple shipping addresses per user
- **Admin Dashboard** - User and vendor management, product approval

### Product Variations
- **Multiple Variation Types** - Color, Size, Material, etc.
- **SKU Management** - Unique SKU for each variation combination
- **Inventory Tracking** - Per-SKU stock levels
- **Price Variations** - Different prices per variation
- **Image per Variation** - Optional images for each SKU

### Security
- **Helmet** - HTTP security headers (XSS protection, content-type sniffing, clickjacking, HSTS)
- **CSRF Protection** - Cookie-based CSRF tokens with skip for public endpoints
- **Rate Limiting** - Protection against brute force attacks
- **Input Validation** - class-validator with DTOs
- **JWT Auth** - Secure token-based authentication with Passport.js

### Email & Notifications
- **Nodemailer** - SMTP email sending
- **BullMQ Queue** - Redis-based background job queue
- **Order Notifications** - Automated emails on status changes
- **Email Templates** - Modern HTML templates for customer, vendor, admin

### Payments
- **Stripe Gateway** - Credit/debit card payments via Stripe Checkout
- **PayPal Gateway** - PayPal checkout integration
- **Bank Transfer** - Manual bank transfer with instructions
- **Cash on Delivery** - COD with delivery confirmation codes
- **Refund Support** - Full refund capability across all gateways

### Developer Experience
- **Swagger Documentation** - Complete API documentation at /docs
- **Health Checks** - /health, /health/ready, /health/live endpoints
- **File Upload** - Product image uploads with Multer
- **E2E Tests** - 28 passing tests with Jest
- **Type Safety** - Full TypeScript with strict mode

## 📦 Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | NestJS v10 |
| **Language** | TypeScript |
| **Database** | PostgreSQL |
| **ORM** | Prisma |
| **Authentication** | JWT + Passport.js |
| **Documentation** | Swagger/OpenAPI |
| **Validation** | class-validator, class-transformer |
| **Email** | Nodemailer |
| **Queue** | BullMQ + Redis |
| **Payments** | Stripe SDK, PayPal SDK |
| **File Upload** | Multer |
| **Security** | Helmet, csurf |
| **Testing** | Jest, Supertest |
| **Configuration** | @nestjs/config |
| **Logging** | NestJS Logger |

## 🛠️ Installation

```bash
# Clone the repository
cd crafty_ecommerce_backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# Start Redis (required for BullMQ email queue)
sudo systemctl start redis-server

# Start development server
npm run start:dev
```

## 🌱 Seeding Sample Data

Populate the database with sample data:

```bash
# Run the seed script
npx prisma db seed

# Or run directly with ts-node
npx ts-node prisma/seed.ts
```

Sample data includes:
- 1 Admin user
- 2 Customer users
- 2 Vendor users with profiles
- 4 Product categories
- 6 Sample products (3 electronics, 3 clothing)
- Sample addresses, reviews, and cart items

## 📦 Product Variations

### Overview

Products can have multiple variation types (e.g., Color, Size). Each combination creates a unique SKU with its own:
- Price
- Quantity/Stock
- Image
- SKU code

### Example: T-Shirt with Color & Size

```json
{
  "name": "Premium T-Shirt",
  "description": "High-quality cotton t-shirt",
  "price": 29.99,
  "categoryId": "uuid",
  "hasVariations": true,
  "variations": [
    {
      "name": "Color",
      "options": ["Red", "Blue", "Green", "Black"]
    },
    {
      "name": "Size",
      "options": ["S", "M", "L", "XL"]
    }
  ],
  "inventory": [
    {
      "sku": "TSHIRT-RED-M",
      "price": 29.99,
      "quantity": 50,
      "imageUrl": "/images/tshirt-red.jpg",
      "options": ["Red", "M"]
    },
    {
      "sku": "TSHIRT-BLUE-L",
      "price": 32.99,
      "quantity": 30,
      "imageUrl": "/images/tshirt-blue.jpg",
      "options": ["Blue", "L"]
    }
  ]
}
```

### Creating Products with Variations

```typescript
POST /products
{
  "name": "T-Shirt",
  "price": 29.99,
  "categoryId": "uuid",
  "hasVariations": true,
  "variations": [
    { "name": "Color", "options": ["Red", "Blue", "Green"] },
    { "name": "Size", "options": ["S", "M", "L", "XL"] }
  ],
  "inventory": [
    { "sku": "TSHIRT-RED-M", "price": 29.99, "quantity": 10, "options": ["Red", "M"] },
    { "sku": "TSHIRT-BLUE-L", "price": 29.99, "quantity": 5, "options": ["Blue", "L"] }
  ]
}
```

### Adding Variation to Cart

When adding a product with variations to cart, specify the inventory ID:

```typescript
POST /cart
{
  "productId": "product-uuid",
  "inventoryId": "inventory-uuid",  // Specific SKU
  "quantity": 2
}
```

### Inventory Management

| Field | Type | Description |
|-------|------|-------------|
| `sku` | String | Unique SKU code |
| `price` | Float | Price for this variation |
| `comparePrice` | Float? | Original price (for显示折扣) |
| `quantity` | Int | Stock quantity |
| `lowStock` | Int | Low stock threshold |
| `weight` | Float? | Weight for shipping |
| `imageUrl` | String? | Variation-specific image |
| `options` | String[] | Selected options (e.g., ["Red", "L"]) |
| `isActive` | Boolean | Enable/disable SKU |

### Variation Combinations

For N variation types with M options each:
- **Total SKUs** = M₁ × M₂ × ... × Mₙ

Examples:
- Color (4) × Size (4) = **16 SKUs**
- Color (5) × Size (4) × Material (2) = **40 SKUs**
- Size (6) = **6 SKUs**

## ⚙️ Configuration

### Environment Variables

```env
# Database
DATABASE_URL="postgresql://postgres:root@localhost:5432/crafty_nest_db_ai?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRATION="7d"

# Server
PORT=3000
NODE_ENV=development

# Upload
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@crafty.com
FROM_NAME="Crafty E-Commerce"

# Admin
ADMIN_EMAIL=admin@crafty.com

# Redis (for BullMQ)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Frontend URLs
FRONTEND_URL=http://localhost:3000
ADMIN_DASHBOARD_URL=http://localhost:3000/admin
VENDOR_DASHBOARD_URL=http://localhost:3000/vendor

# CSRF Protection
CSRF_SECRET=your-csrf-secret

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# PayPal
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
PAYPAL_SANDBOX=true

# Bank Transfer
BANK_NAME=Crafty Bank
BANK_ACCOUNT_NUMBER=...
```

### Email Setup (Gmail)

For Gmail, use an [App Password](https://myaccount.google.com/apppasswords):
1. Enable 2FA on your Google account
2. Go to Security → App passwords
3. Create a password for "Mail" app
4. Use the generated password in `SMTP_PASS`

## 📧 Email Notifications

### Order Status Flow
```
PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED
                  ↓
              CANCELLED
                  ↓
              REFUNDED
```

### Recipients
- **Customer** - Receives notifications for all status changes
- **Vendor** - Receives notifications for new orders containing their products
- **Admin** - Receives notifications for all order activity

### Email Templates
Three distinct modern HTML templates:
- Customer (purple gradient theme)
- Vendor (green gradient theme)  
- Admin (dark blue theme)

### BullMQ Email Queue
- **Job Persistence** - Survives server restarts
- **Automatic Retries** - 3 attempts with exponential backoff
- **Job Types** - customer-order, vendor-order, admin-order
- **Queue Stats** - Monitor via `getQueueStats()`

## 💳 Payment Gateways

### Supported Methods
| Method | Type | Features |
|--------|------|----------|
| `stripe` | online | Credit/Debit Cards, Webhooks, Refunds, Checkout |
| `paypal` | online | PayPal Checkout, Sandbox Mode |
| `bank_transfer` | offline | Manual Transfer, Reference Numbers, 72h Deadline |
| `cod` | offline | Cash on Delivery, Confirmation Codes, 7-day Validity |

### Usage
```typescript
// Create payment
const payment = await paymentService.createPayment({
  orderId: 'order-uuid',
  method: 'stripe', // or 'paypal', 'bank_transfer', 'cod'
  amount: 99.99,
  currency: 'USD',
});

// Returns: { transactionId, status, redirectUrl }

// Confirm COD payment on delivery
await paymentService.confirmCodPayment(transactionId, 'DELIVERY-CODE');
```

### Status Updates
Payment completion automatically updates order status to `CONFIRMED`.

### Available Payment Methods API
```bash
GET /payments/methods
# Returns: [{ name, label, type }]
```

## 🔐 Security Features

### Helmet Headers
- XSS Protection
- Content-Type Sniffing Prevention
- Clickjacking Protection
- Strict Transport Security (HSTS)
- Frameguard, DNS Prefetch Control, IE No-Open

### CSRF Protection
- Cookie-based CSRF tokens
- Skipped for: /api/v1/auth/*, /docs, /health/*
- Requires `CSRF_SECRET` in production

### Authentication
- JWT Bearer tokens
- Role-based access control (CUSTOMER, VENDOR, ADMIN)
- Protected routes with guards

## 📚 API Documentation

Access Swagger documentation at:
```
http://localhost:3000/docs
```

## 🔗 API Endpoints

### Authentication (`/api/v1/auth`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Register new user |
| POST | `/login` | Login and get JWT token |
| GET | `/profile` | Get current user profile |

### Users (`/api/v1/users`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/profile` | Get current user profile |
| PUT | `/profile` | Update current user profile |
| GET | `/` | Get all users (admin only) |

### Vendors (`/api/v1/vendors`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Create vendor profile |
| GET | `/me` | Get current vendor profile |
| GET | `/` | Get all vendors |

### Products (`/api/v1/products`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get all products (public) |
| POST | `/` | Create new product (vendor) |
| POST | `/:id/images` | Add product images |

### Orders (`/api/v1/orders`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Create order from cart |
| GET | `/` | Get user's orders |
| PUT | `/:id/status` | Update order status |

### Payments (`/api/v1/payments`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/order/:orderId` | Get payment by order |
| GET | `/methods` | Get available payment methods |
| POST | `/create` | Create payment session |
| POST | `/confirm-cod` | Confirm COD payment |

## 📁 Project Structure

```
src/
├── main.ts                              # Application entry point
├── app.module.ts                        # Root module
├── auth/                                # Authentication
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── auth.module.ts
│   └── dto/
├── users/                               # User management
├── vendors/                             # Vendor management
├── products/                            # Product management
│   ├── products.controller.ts
│   ├── products.service.ts
│   ├── products.module.ts
│   └── dto/
│       ├── product.dto.ts
│       └── variation.dto.ts            # Variation DTOs
├── categories/                          # Category management
├── cart/                                # Shopping cart
│   ├── cart.controller.ts
│   ├── cart.service.ts                 # Updated for variations
│   └── dto/
│       └── cart.dto.ts                 # Updated with inventoryId
├── orders/                              # Order processing
│   ├── orders.service.ts
│   └── dto/
├── payments/                            # Payment processing
│   └── common/payment/                 # Payment gateway modules
│       ├── interfaces/
│       │   └── payment-gateway.interface.ts
│       ├── gateways/
│       │   ├── stripe.gateway.ts
│       │   ├── paypal.gateway.ts
│       │   ├── bank-transfer.gateway.ts
│       │   └── cod.gateway.ts
│       ├── payment.service.ts
│       └── payment.module.ts
├── reviews/                             # Product reviews
├── wishlist/                            # Wishlist management
├── addresses/                           # Address management
├── admin/                               # Admin dashboard
├── upload/                              # File uploads
└── common/                               # Shared utilities
    ├── guards/                          # Auth guards
    ├── decorators/                      # Custom decorators
    ├── prisma/                          # Prisma service
    ├── email/                           # Email + BullMQ queue
    └── interfaces/                       # Common interfaces
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run e2e tests
npm run test:e2e

# Run with coverage
npm run test:cov

# Test Results
# Test Suites: 10 passed, 10 total
# Tests:       28 passed, 28 total
```

### Test Suites
| Suite | Tests | Status |
|-------|-------|--------|
| health.e2e-spec.ts | 5 | ✅ PASS |
| categories.e2e-spec.ts | 3 | ✅ PASS |
| addresses.e2e-spec.ts | 3 | ✅ PASS |
| users.e2e-spec.ts | 3 | ✅ PASS |
| reviews.e2e-spec.ts | 2 | ✅ PASS |
| cart.e2e-spec.ts | 3 | ✅ PASS |
| auth.e2e-spec.ts | 3 | ✅ PASS |
| products.e2e-spec.ts | 3 | ✅ PASS |
| wishlist.e2e-spec.ts | 2 | ✅ PASS |
| vendors.e2e-spec.ts | 1 | ✅ PASS |

## 🚀 Running in Production

```bash
# Build the application
npm run build

# Start production server
node dist/main.js

# Ensure Redis is running for email queue
```

## 📝 Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `JWT_SECRET` | JWT signing secret | Yes |
| `JWT_EXPIRATION` | Token expiration (default: 7d) | No |
| `PORT` | Server port (default: 3000) | No |
| `NODE_ENV` | Environment (development/production) | No |
| `UPLOAD_PATH` | Upload directory | No |
| `MAX_FILE_SIZE` | Max upload size in bytes | No |
| `SMTP_HOST` | SMTP server host | Yes |
| `SMTP_PORT` | SMTP server port | Yes |
| `SMTP_USER` | SMTP username | Yes |
| `SMTP_PASS` | SMTP password | Yes |
| `FROM_EMAIL` | Sender email | Yes |
| `FROM_NAME` | Sender name | Yes |
| `ADMIN_EMAIL` | Admin notification email | Yes |
| `REDIS_HOST` | Redis server host | Yes |
| `REDIS_PORT` | Redis server port | Yes |
| `REDIS_PASSWORD` | Redis password (optional) | No |
| `REDIS_DB` | Redis database number | No |
| `FRONTEND_URL` | Frontend URL | Yes |
| `ADMIN_DASHBOARD_URL` | Admin dashboard URL | Yes |
| `VENDOR_DASHBOARD_URL` | Vendor dashboard URL | Yes |
| `CSRF_SECRET` | CSRF protection secret | Production |
| `STRIPE_SECRET_KEY` | Stripe secret key | For Stripe |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | For