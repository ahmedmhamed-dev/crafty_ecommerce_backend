import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/order.dto';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateOrderDto) {
    const cartItems = await this.prisma.cartItem.findMany({
      where: { userId },
      include: { product: true },
    });

    if (cartItems.length === 0) throw new NotFoundException('Cart is empty');

    const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const orderNumber = 'ORD-' + uuidv4().slice(0, 8).toUpperCase();

    const order = await this.prisma.order.create({
      data: {
        orderNumber,
        userId,
        subtotal,
        total: subtotal,
        status: 'PENDING',
        notes: dto.notes,
        items: {
          create: cartItems.map(item => ({
            productId: item.productId,
            vendorId: item.product.vendorId,
            name: item.product.name,
            sku: item.product.sku,
            price: item.product.price,
            quantity: item.quantity,
            total: item.product.price * item.quantity,
          })),
        },
      },
    });

    await this.prisma.cartItem.deleteMany({ where: { userId } });
    return order;
  }

  async findAll(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        skip,
        take: limit,
        include: { items: true, user: { select: { email: true, firstName: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.count(),
    ]);
    return { data: orders, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findById(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: { include: { vendor: { select: { storeName: true } } } }, user: true },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async findByUser(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto) {
    await this.findById(id);
    return this.prisma.order.update({
      where: { id },
      data: { status: dto.status as any },
    });
  }
}
