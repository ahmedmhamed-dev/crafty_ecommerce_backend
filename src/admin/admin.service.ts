import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboard() {
    const [users, vendors, products, orders] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.vendor.count(),
      this.prisma.product.count(),
      this.prisma.order.count(),
    ]);
    return { users, vendors, products, orders };
  }

  async getPendingVendors() {
    return this.prisma.vendor.findMany({ where: { status: 'PENDING' }, include: { user: true } });
  }

  async getPendingProducts() {
    return this.prisma.product.findMany({ where: { status: 'PENDING' }, include: { vendor: true, category: true } });
  }
}
