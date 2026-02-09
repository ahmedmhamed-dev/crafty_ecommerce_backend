# Crafty E-Commerce Backend

A comprehensive multi-vendor e-commerce backend API built with NestJS, PostgreSQL, and Prisma ORM.

## 🚀 Features

- **Multi-Vendor Support** - Multiple vendors can register, manage products, and process orders
- **JWT Authentication** - Secure authentication with role-based access control
- **Product Management** - Full CRUD operations with image gallery support
- **Category System** - Hierarchical categories for products
- **Shopping Cart** - Complete cart management
- **Order Processing** - Order creation, tracking, and status updates
- **Payment Tracking** - Payment status tracking
- **Product Reviews** - Rating and review system
- **Wishlist** - Users can save products to wishlist
- **Address Management** - Multiple shipping addresses per user
- **Admin Dashboard** - User and vendor management, product approval
- **File Upload** - Product image uploads
- **Swagger Documentation** - Complete API documentation
- **Health Checks** - /health, /health/ready, /health/live endpoints
- **Rate Limiting** - Protection against brute force attacks

## 📦 Tech Stack

- **Framework**: NestJS v10
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT (Passport)
- **Documentation**: Swagger/OpenAPI
- **Validation**: class-validator

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

## ⚙️ Configuration

Create a `.env` file in the root directory:

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
```

## 📚 API Documentation

Once the server is running, access Swagger documentation at:

```
http://localhost:3000/docs
```

## 🔗 API Endpoints

### Authentication (`/api/v1/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|--------------|
| POST | `/register` | Register new user | No |
| POST | `/login` | Login and get JWT token | No |
| GET | `/profile` | Get current user profile | Yes |

### Users (`/api/v1/users`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|--------------|
| GET | `/profile` | Get current user profile | Yes |
| PUT | `/profile` | Update current user profile | Yes |
| GET | `/` | Get all users (admin only) | Yes (Admin) |
| GET | `/:id` | Get user by ID | Yes (Admin) |

### Vendors (`/api/v1/vendors`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|--------------|
| POST | `/` | Create vendor profile | Yes |
| GET | `/me` | Get current vendor profile | Yes |
| PUT | `/me` | Update vendor profile | Yes |
| GET | `/` | Get all vendors | No |
| GET | `/:id` | Get vendor by ID | No |
| PUT | `/:id/status` | Update vendor status (approve/reject) | Yes (Admin) |

### Products (`/api/v1/products`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|--------------|
| GET | `/` | Get all products (public) | No |
| GET | `/:id` | Get product by ID | No |
| POST | `/` | Create new product | Yes (Vendor) |
| PUT | `/:id` | Update product | Yes (Vendor Owner) |
| POST | `/:id/images` | Add product images | Yes (Vendor Owner) |
| GET | `/vendor/me` | Get vendor's own products | Yes (Vendor) |
| PUT | `/:id/status` | Update product status (approve/reject) | Yes (Admin) |

### Categories (`/api/v1/categories`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|--------------|
| GET | `/` | Get all categories | No |
| GET | `/:id` | Get category by ID | No |
| POST | `/` | Create category | Yes (Admin) |
| PUT | `/:id` | Update category | Yes (Admin) |
| DELETE | `/:id` | Delete category | Yes (Admin) |

### Cart (`/api/v1/cart`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|--------------|
| GET | `/` | Get cart items | Yes |
| POST | `/` | Add item to cart | Yes |
| PUT | `/:productId` | Update item quantity | Yes |
| DELETE | `/:productId` | Remove item from cart | Yes |
| DELETE | `/` | Clear cart | Yes |

### Orders (`/api/v1/orders`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|--------------|
| POST | `/` | Create order from cart | Yes |
| GET | `/` | Get user's orders | Yes |
| GET | `/all` | Get all orders | Yes (Admin) |
| GET | `/:id` | Get order by ID | Yes |
| PUT | `/:id/status` | Update order status | Yes (Admin) |

### Reviews (`/api/v1/reviews`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|--------------|
| POST | `/` | Create product review | Yes |
| GET | `/product/:productId` | Get product reviews | No |

### Wishlist (`/api/v1/wishlist`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|--------------|
| GET | `/` | Get wishlist | Yes |
| POST | `/` | Add product to wishlist | Yes |
| DELETE | `/:productId` | Remove from wishlist | Yes |

### Addresses (`/api/v1/addresses`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|--------------|
| GET | `/` | Get user addresses | Yes |
| POST | `/` | Create address | Yes |
| PUT | `/:id` | Update address | Yes |
| DELETE | `/:id` | Delete address | Yes |

### Payments (`/api/v1/payments`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|--------------|
| GET | `/order/:orderId` | Get payment by order | Yes |

### Admin (`/api/v1/admin`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|--------------|
| GET | `/dashboard` | Get dashboard statistics | Yes (Admin) |
| GET | `/pending-vendors` | Get pending vendor applications | Yes (Admin) |
| GET | `/pending-products` | Get pending products for approval | Yes (Admin) |

### Upload (`/api/v1/upload`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|--------------|
| POST | `/` | Upload file | Yes (Vendor/Admin) |

## 🔐 Authentication & Authorization

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### User Roles

- **CUSTOMER** - Regular users who can browse and purchase
- **VENDOR** - Sellers who can manage products
- **ADMIN** - Administrators with full access

## 🗄️ Database Schema

### Models

- **User** - User accounts with role-based access
- **Vendor** - Vendor profiles linked to users
- **Product** - Products with images, pricing, inventory
- **Category** - Hierarchical product categories
- **CartItem** - Items in user's shopping cart
- **Order/OrderItem** - Orders with status tracking
- **Payment** - Payment records
- **Review** - Product reviews with ratings
- **Wishlist** - User's saved products
- **Address** - User shipping addresses

## 📁 Project Structure

```
src/
├── main.ts                    # Application entry point
├── app.module.ts             # Root module
├── auth/                     # Authentication module
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── auth.module.ts
│   └── dto/
├── users/                    # User management
├── vendors/                  # Vendor management
├── products/                # Product management
├── categories/              # Category management
├── cart/                     # Shopping cart
├── orders/                  # Order processing
├── payments/                # Payment tracking
├── reviews/                 # Product reviews
├── wishlist/                # Wishlist management
├── addresses/               # Address management
├── admin/                    # Admin dashboard
└── common/                   # Shared utilities
    ├── guards/              # Auth guards
    ├── decorators/          # Custom decorators
    ├── prisma/              # Prisma service
    └── upload/              # File upload
```

## 🚀 Running in Production

```bash
# Build the application
npm run build

# Start production server
node dist/main.js
```

## 📝 License

MIT License

## 🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first.
