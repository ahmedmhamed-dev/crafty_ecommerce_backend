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

  // ========== SIMPLE PRODUCTS (No Variations) ==========
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
        hasVariations: false,
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
        hasVariations: false,
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
        hasVariations: false,
      },
    }),
  ]);
  console.log('✅ Created 3 simple products');

  // ========== PRODUCT 1: T-SHIRT (Color × Size = 20 SKUs) ==========
  const tshirtProduct = await prisma.product.upsert({
    where: { id: 'prod-tshirt' },
    update: {},
    create: {
      id: 'prod-tshirt',
      vendorId: fashionHub.id,
      categoryId: 'cat-clothing',
      name: 'Classic Cotton T-Shirt',
      slug: 'classic-cotton-tshirt',
      description: 'Comfortable 100% cotton t-shirt, perfect for everyday wear',
      price: 29.99,
      sku: 'TSHIRT001',
      quantity: 500,
      status: 'APPROVED',
      isActive: true,
      hasVariations: true,
    },
  });

  await prisma.productVariation.createMany({
    data: [
      { productId: tshirtProduct.id, name: 'Color', options: ['White', 'Black', 'Navy', 'Gray'] },
      { productId: tshirtProduct.id, name: 'Size', options: ['S', 'M', 'L', 'XL', 'XXL'] },
    ],
  });

  const tshirtColorOptions = ['White', 'Black', 'Navy', 'Gray'];
  const tshirtSizeOptions = ['S', 'M', 'L', 'XL', 'XXL'];
  for (const color of tshirtColorOptions) {
    for (const size of tshirtSizeOptions) {
      await prisma.productInventory.create({
        data: {
          productId: tshirtProduct.id,
          sku: 'TSHIRT-' + color.toUpperCase() + '-' + size,
          price: color === 'White' ? 24.99 : 29.99,
          quantity: Math.floor(Math.random() * 50) + 10,
          lowStock: 5,
          options: [color, size],
          isActive: true,
        },
      });
    }
  }
  console.log('✅ Created T-Shirt with 20 SKU variations');

  // ========== PRODUCT 2: RUNNING SHOES (Color × Size = 24 SKUs) ==========
  const shoesProduct = await prisma.product.upsert({
    where: { id: 'prod-shoes' },
    update: {},
    create: {
      id: 'prod-shoes',
      vendorId: fashionHub.id,
      categoryId: 'cat-clothing',
      name: 'Pro Running Shoes',
      slug: 'pro-running-shoes',
      description: 'Lightweight running shoes with superior cushioning',
      price: 129.99,
      sku: 'SHOES001',
      quantity: 200,
      status: 'APPROVED',
      isActive: true,
      hasVariations: true,
    },
  });

  await prisma.productVariation.createMany({
    data: [
      { productId: shoesProduct.id, name: 'Color', options: ['Red', 'Blue', 'Black', 'White'] },
      { productId: shoesProduct.id, name: 'Size', options: ['7', '8', '9', '10', '11', '12'] },
    ],
  });

  const shoeColorOptions = ['Red', 'Blue', 'Black', 'White'];
  const shoeSizeOptions = ['7', '8', '9', '10', '11', '12'];
  for (const color of shoeColorOptions) {
    for (const size of shoeSizeOptions) {
      await prisma.productInventory.create({
        data: {
          productId: shoesProduct.id,
          sku: 'SHOES-' + color.toUpperCase() + '-' + size,
          price: 119.99 + (color === 'Red' ? 10 : 0),
          quantity: Math.floor(Math.random() * 30) + 5,
          lowStock: 3,
          options: [color, size],
          isActive: true,
        },
      });
    }
  }
  console.log('✅ Created Running Shoes with 24 SKU variations');

  // ========== PRODUCT 3: LAPTOP (Storage × RAM = 12 SKUs) ==========
  const laptopProduct = await prisma.product.upsert({
    where: { id: 'prod-laptop' },
    update: {},
    create: {
      id: 'prod-laptop',
      vendorId: techStore.id,
      categoryId: 'cat-electronics',
      name: 'UltraBook Pro',
      slug: 'ultrabook-pro',
      description: 'Thin and light laptop for professionals',
      price: 999.00,
      sku: 'LAPTOP001',
      quantity: 100,
      status: 'APPROVED',
      isActive: true,
      hasVariations: true,
    },
  });

  await prisma.productVariation.createMany({
    data: [
      { productId: laptopProduct.id, name: 'Storage', options: ['256GB', '512GB', '1TB', '2TB'] },
      { productId: laptopProduct.id, name: 'RAM', options: ['8GB', '16GB', '32GB'] },
    ],
  });

  const storageOptions = ['256GB', '512GB', '1TB', '2TB'];
  const ramOptions = ['8GB', '16GB', '32GB'];
  for (const storage of storageOptions) {
    for (const ram of ramOptions) {
      let price = 999.00;
      if (storage === '512GB') price += 150;
      if (storage === '1TB') price += 300;
      if (storage === '2TB') price += 500;
      if (ram === '16GB') price += 100;
      if (ram === '32GB') price += 250;
      await prisma.productInventory.create({
        data: {
          productId: laptopProduct.id,
          sku: 'LAPTOP-' + storage.replace('TB', 'T').replace('GB', 'G') + '-' + ram.replace('GB', 'G'),
          price: price,
          quantity: Math.floor(Math.random() * 20) + 5,
          lowStock: 2,
          options: [storage, ram],
          isActive: true,
        },
      });
    }
  }
  console.log('✅ Created Laptop with 12 SKU variations');

  // ========== PRODUCT 4: HOODIE (Color × Size = 20 SKUs) ==========
  const hoodieProduct = await prisma.product.upsert({
    where: { id: 'prod-hoodie' },
    update: {},
    create: {
      id: 'prod-hoodie',
      vendorId: fashionHub.id,
      categoryId: 'cat-clothing',
      name: 'Classic Pullover Hoodie',
      slug: 'classic-pullover-hoodie',
      description: 'Warm and cozy hoodie for all seasons',
      price: 59.99,
      sku: 'HOODIE001',
      quantity: 300,
      status: 'APPROVED',
      isActive: true,
      hasVariations: true,
    },
  });

  await prisma.productVariation.createMany({
    data: [
      { productId: hoodieProduct.id, name: 'Color', options: ['Black', 'Gray', 'Burgundy', 'Forest Green'] },
      { productId: hoodieProduct.id, name: 'Size', options: ['XS', 'S', 'M', 'L', 'XL'] },
    ],
  });

  const hoodieColorOptions = ['Black', 'Gray', 'Burgundy', 'Forest Green'];
  const hoodieSizeOptions = ['XS', 'S', 'M', 'L', 'XL'];
  for (const color of hoodieColorOptions) {
    for (const size of hoodieSizeOptions) {
      const isPremiumColor = color === 'Burgundy' || color === 'Forest Green';
      await prisma.productInventory.create({
        data: {
          productId: hoodieProduct.id,
          sku: 'HOODIE-' + (color.split(' ')[0]).toUpperCase() + '-' + size,
          price: isPremiumColor ? 64.99 : 59.99,
          quantity: Math.floor(Math.random() * 40) + 10,
          lowStock: 5,
          options: [color, size],
          isActive: true,
        },
      });
    }
  }
  console.log('✅ Created Hoodie with 20 SKU variations');

  // ========== SAMPLE CART WITH VARIATIONS ==========
  const tshirtInv = await prisma.productInventory.findFirst({ where: { productId: 'prod-tshirt' } });
  const shoesInv = await prisma.productInventory.findFirst({ where: { productId: 'prod-shoes' } });

  if (tshirtInv && shoesInv) {
    await prisma.cartItem.createMany({
      data: [
        { userId: customer1.id, productId: 'prod-airpods', quantity: 1 },
        { userId: customer1.id, productId: tshirtInv.productId, inventoryId: tshirtInv.id, quantity: 2 },
        { userId: customer1.id, productId: shoesInv.productId, inventoryId: shoesInv.id, quantity: 1 },
      ],
      skipDuplicates: true,
    });
  }
  console.log('✅ Created sample cart items with variations');

  // ========== SAMPLE ADDRESSES ==========
  await prisma.address.createMany({
    data: [
      { userId: customer1.id, firstName: 'John', lastName: 'Doe', address1: '123 Main Street', city: 'San Francisco', state: 'CA', postalCode: '94102', country: 'USA', phone: '+1 234 567 8900', isDefault: true },
      { userId: customer2.id, firstName: 'Jane', lastName: 'Smith', address1: '456 Market Street', city: 'San Francisco', state: 'CA', postalCode: '94103', country: 'USA', phone: '+1 234 567 8901', isDefault: true },
    ],
    skipDuplicates: true,
  });
  console.log('✅ Created sample addresses');

  // ========== SAMPLE REVIEWS ==========
  await prisma.review.createMany({
    data: [
      { productId: 'prod-iphone15', userId: customer1.id, rating: 5, title: 'Amazing phone!', comment: 'Best iPhone ever!' },
      { productId: 'prod-iphone15', userId: customer2.id, rating: 4, title: 'Great but expensive', comment: 'Love the features.' },
      { productId: 'prod-tshirt', userId: customer1.id, rating: 5, title: 'Very comfortable', comment: 'Great quality cotton.' },
    ],
    skipDuplicates: true,
  });
  console.log('✅ Created sample reviews');

  console.log('');
  console.log('🎉 Seeding completed!');
  console.log('');
  console.log('📦 Total Products: 7 (3 simple + 4 with variations)');
  console.log('📊 Total SKUs: 86');
  console.log('');

}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
