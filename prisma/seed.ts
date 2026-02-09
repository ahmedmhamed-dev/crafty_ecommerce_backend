import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create Admin User
  const admin = await prisma.user.upsert({
    where: { email: 'admin@crafty.com' },
    update: {},
    create: {
      email: 'admin@crafty.com',
      firstName: 'Admin',
      lastName: 'User',
      password: '$2b$10$abcdefghijklmnopqrstuv',
      role: 'ADMIN',
      isActive: true,
      emailVerified: true,
    },
  });
  console.log('✅ Created admin user:', admin.email);

  // Create Categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { id: 'cat-electronics' },
      update: {},
      create: {
        id: 'cat-electronics',
        name: 'Electronics',
        slug: 'electronics',
        description: 'Electronic devices and gadgets',
        isActive: true,
      },
    }),
    prisma.category.upsert({
      where: { id: 'cat-clothing' },
      update: {},
      create: {
        id: 'cat-clothing',
        name: 'Clothing',
        slug: 'clothing',
        description: 'Fashion and apparel',
        isActive: true,
      },
    }),
    prisma.category.upsert({
      where: { id: 'cat-home' },
      update: {},
      create: {
        id: 'cat-home',
        name: 'Home & Garden',
        slug: 'home-garden',
        description: 'Home improvement and garden supplies',
        isActive: true,
      },
    }),
    prisma.category.upsert({
      where: { id: 'cat-books' },
      update: {},
      create: {
        id: 'cat-books',
        name: 'Books',
        slug: 'books',
        description: 'Books, ebooks and audiobooks',
        isActive: true,
      },
    }),
  ]);
  console.log('✅ Created', categories.length, 'categories');

  // Create Sample Users (Customers)
  const customer1 = await prisma.user.upsert({
    where: { email: 'john@example.com' },
    update: {},
    create: {
      email: 'john@example.com',
      firstName: 'John',
      lastName: 'Doe',
      password: '$2b$10$abcdefghijklmnopqrstuv',
      role: 'CUSTOMER',
      isActive: true,
    },
  });

  const customer2 = await prisma.user.upsert({
    where: { email: 'jane@example.com' },
    update: {},
    create: {
      email: 'jane@example.com',
      firstName: 'Jane',
      lastName: 'Smith',
      password: '$2b$10$abcdefghijklmnopqrstuv',
      role: 'CUSTOMER',
      isActive: true,
    },
  });
  console.log('✅ Created customer users');

  // Create Vendor Users
  const vendor1User = await prisma.user.upsert({
    where: { email: 'vendor1@techstore.com' },
    update: {},
    create: {
      email: 'vendor1@techstore.com',
      firstName: 'Tech',
      lastName: 'Store',
      password: '$2b$10$abcdefghijklmnopqrstuv',
      role: 'VENDOR',
      isActive: true,
    },
  });

  const vendor2User = await prisma.user.upsert({
    where: { email: 'vendor2@fashionhub.com' },
    update: {},
    create: {
      email: 'vendor2@fashionhub.com',
      firstName: 'Fashion',
      lastName: 'Hub',
      password: '$2b$10$abcdefghijklmnopqrstuv',
      role: 'VENDOR',
      isActive: true,
    },
  });
  console.log('✅ Created vendor users');

  // Create Vendor Profiles
  const techStore = await prisma.vendor.upsert({
    where: { id: 'vendor-techstore' },
    update: {},
    create: {
      id: 'vendor-techstore',
      userId: vendor1User.id,
      storeName: 'Tech Store',
      storeSlug: 'tech-store',
      description: 'Your one-stop shop for all electronics',
      email: 'vendor1@techstore.com',
      phone: '+1234567890',
      address: '123 Tech Street',
      city: 'Silicon Valley',
      state: 'CA',
      country: 'USA',
      status: 'APPROVED',
    },
  });

  const fashionHub = await prisma.vendor.upsert({
    where: { id: 'vendor-fashionhub' },
    update: {},
    create: {
      id: 'vendor-fashionhub',
      userId: vendor2User.id,
      storeName: 'Fashion Hub',
      storeSlug: 'fashion-hub',
      description: 'Trendy fashion for everyone',
      email: 'vendor2@fashionhub.com',
      phone: '+1987654321',
      address: '456 Fashion Ave',
      city: 'New York',
      state: 'NY',
      country: 'USA',
      status: 'APPROVED',
    },
  });
  console.log('✅ Created vendor profiles');

  // Create Products
  await Promise.all([
    prisma.product.upsert({
      where: { id: 'prod-iphone15' },
      update: {},
      create: {
        id: 'prod-iphone15',
        vendorId: techStore.id,
        categoryId: 'cat-electronics',
        name: 'iPhone 15 Pro Max',
        slug: 'iphone-15-pro-max',
        description: 'Latest Apple iPhone with A17 Pro chip, 48MP camera',
        price: 1199.00,
        sku: 'IPH15PM001',
        quantity: 100,
        status: 'APPROVED',
        isActive: true,
      },
    }),
    prisma.product.upsert({
      where: { id: 'prod-macbook' },
      update: {},
      create: {
        id: 'prod-macbook',
        vendorId: techStore.id,
        categoryId: 'cat-electronics',
        name: 'MacBook Pro 14" M3',
        slug: 'macbook-pro-14-m3',
        description: 'Powerful laptop with Apple M3 chip',
        price: 1999.00,
        sku: 'MBP14M3001',
        quantity: 50,
        status: 'APPROVED',
        isActive: true,
      },
    }),
    prisma.product.upsert({
      where: { id: 'prod-airpods' },
      update: {},
      create: {
        id: 'prod-airpods',
        vendorId: techStore.id,
        categoryId: 'cat-electronics',
        name: 'AirPods Pro 2nd Gen',
        slug: 'airpods-pro-2',
        description: 'Active noise cancellation earbuds',
        price: 249.00,
        sku: 'APP2G001',
        quantity: 200,
        status: 'APPROVED',
        isActive: true,
      },
    }),
    prisma.product.upsert({
      where: { id: 'prod-tshirt' },
      update: {},
      create: {
        id: 'prod-tshirt',
        vendorId: fashionHub.id,
        categoryId: 'cat-clothing',
        name: 'Classic Cotton T-Shirt',
        slug: 'classic-cotton-tshirt',
        description: 'Comfortable 100% cotton t-shirt',
        price: 29.99,
        sku: 'TSHIRT001',
        quantity: 500,
        status: 'APPROVED',
        isActive: true,
      },
    }),
    prisma.product.upsert({
      where: { id: 'prod-jeans' },
      update: {},
      create: {
        id: 'prod-jeans',
        vendorId: fashionHub.id,
        categoryId: 'cat-clothing',
        name: 'Slim Fit Denim Jeans',
        slug: 'slim-fit-denim-jeans',
        description: 'Modern slim fit denim jeans',
        price: 79.99,
        sku: 'JEANS001',
        quantity: 150,
        status: 'APPROVED',
        isActive: true,
      },
    }),
    prisma.product.upsert({
      where: { id: 'prod-jacket' },
      update: {},
      create: {
        id: 'prod-jacket',
        vendorId: fashionHub.id,
        categoryId: 'cat-clothing',
        name: 'Winter Jacket',
        slug: 'winter-jacket',
        description: 'Warm and stylish winter jacket',
        price: 149.99,
        sku: 'JACKET001',
        quantity: 75,
        status: 'APPROVED',
        isActive: true,
      },
    }),
  ]);
  console.log('✅ Created 6 products');

  // Create Sample Addresses
  await prisma.address.createMany({
    data: [
      {
        userId: customer1.id,
        firstName: 'John',
        lastName: 'Doe',
        address1: '123 Main Street',
        city: 'San Francisco',
        state: 'CA',
        postalCode: '94102',
        country: 'USA',
        phone: '+1 234 567 8900',
        isDefault: true,
      },
      {
        userId: customer2.id,
        firstName: 'Jane',
        lastName: 'Smith',
        address1: '456 Market Street',
        city: 'San Francisco',
        state: 'CA',
        postalCode: '94103',
        country: 'USA',
        phone: '+1 234 567 8901',
        isDefault: true,
      },
    ],
    skipDuplicates: true,
  });
  console.log('✅ Created sample addresses');

  // Create Sample Reviews
  await prisma.review.createMany({
    data: [
      {
        productId: 'prod-iphone15',
        userId: customer1.id,
        rating: 5,
        title: 'Amazing phone!',
        comment: 'Best iPhone ever! Camera is incredible.',
      },
      {
        productId: 'prod-iphone15',
        userId: customer2.id,
        rating: 4,
        title: 'Great but expensive',
        comment: 'Love the features, but the price is steep.',
      },
      {
        productId: 'prod-tshirt',
        userId: customer1.id,
        rating: 5,
        title: 'Very comfortable',
        comment: 'Great quality cotton, fits perfectly.',
      },
    ],
    skipDuplicates: true,
  });
  console.log('✅ Created sample reviews');

  // Create Sample Cart Items
  await prisma.cartItem.createMany({
    data: [
      {
        userId: customer1.id,
        productId: 'prod-airpods',
        quantity: 1,
      },
      {
        userId: customer1.id,
        productId: 'prod-tshirt',
        quantity: 2,
      },
    ],
    skipDuplicates: true,
  });
  console.log('✅ Created sample cart items');

  console.log('');
  console.log('🎉 Database seeding completed!');
  console.log('');
  console.log('Sample Accounts:');
  console.log('─────────────────────');
  console.log('Admin: admin@crafty.com (admin role)');
  console.log('Customer: john@example.com');
  console.log('Customer: jane@example.com');
  console.log('Vendor: vendor1@techstore.com');
  console.log('Vendor: vendor2@fashionhub.com');
  console.log('');
  console.log('Note: Passwords are placeholders. Register new users via API.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
