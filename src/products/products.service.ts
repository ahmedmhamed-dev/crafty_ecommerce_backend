import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { Prisma, ProductStatus } from '@prisma/client';
import { CreateProductDto, UpdateProductDto, ProductImageDto } from './dto/product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateProductDto) {
    const vendor = await this.prisma.vendor.findUnique({ where: { userId } });
    if (!vendor) throw new ForbiddenException('Vendor profile required');

    return this.prisma.product.create({
      data: {
        vendorId: vendor.id,
        ...dto,
        status: 'PENDING',
      },
    });
  }

  async findAll(page = 1, limit = 10, search?: string, categoryId?: string) {
    const skip = (page - 1) * limit;
    const where: Prisma.ProductWhereInput = {
      status: ProductStatus.APPROVED,
      isActive: true,
      ...(search && { name: { contains: search, mode: 'insensitive' } }),
      ...(categoryId && { categoryId }),
    };
    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        include: { images: true, category: true, vendor: { select: { storeName: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count({ where }),
    ]);
    return { data: products, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findById(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        category: true,
        vendor: true,
        reviews: { include: { user: { select: { firstName: true } } } },
        variations: true,
        inventory: { where: { isActive: true }, orderBy: { sku: 'asc' } },
      },
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async update(id: string, userId: string, dto: UpdateProductDto) {
    const product = await this.findById(id);
    const vendor = await this.prisma.vendor.findUnique({ where: { userId } });
    if (product.vendorId !== vendor?.id) throw new ForbiddenException('Not your product');
    return this.prisma.product.update({ where: { id }, data: dto });
  }

  async addImages(id: string, userId: string, images: ProductImageDto[]) {
    const product = await this.findById(id);
    const vendor = await this.prisma.vendor.findUnique({ where: { userId } });
    if (product.vendorId !== vendor?.id) throw new ForbiddenException('Not your product');
    return this.prisma.productImage.createMany({
      data: images.map(img => ({ ...img, productId: id })),
    });
  }

  async vendorProducts(userId: string, page = 1, limit = 10) {
    const vendor = await this.prisma.vendor.findUnique({ where: { userId } });
    const skip = (page - 1) * limit;
    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where: { vendorId: vendor?.id },
        skip,
        take: limit,
        include: { images: true, variations: true, inventory: { where: { isActive: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count({ where: { vendorId: vendor?.id } }),
    ]);
    return { data: products, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async updateStatus(id: string, status: string) {
    await this.findById(id);
    return this.prisma.product.update({ where: { id }, data: { status: status as any } });
  }
}
