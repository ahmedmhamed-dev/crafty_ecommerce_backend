import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { EmailQueueService, OrderEmailData, VendorEmailData } from '../common/email/email-queue.service';
import { v4 as uuidv4 } from 'uuid';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/order.dto';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private emailQueue: EmailQueueService,
  ) {}

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
      include: {
        user: true,
        items: { include: { vendor: true } },
      },
    });

    await this.prisma.cartItem.deleteMany({ where: { userId } });

    // Queue emails for new order (non-blocking)
    this.queueOrderEmails(order.id, 'PENDING');

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
      include: {
        items: { include: { vendor: { select: { storeName: true, email: true } } } },
        user: true,
      },
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
    const order = await this.findById(id);
    const previousStatus = order.status;
    
    if (previousStatus === dto.status) {
      throw new BadRequestException('Order is already in this status');
    }

    // Validate status transitions
    this.validateStatusTransition(previousStatus, dto.status);

    const updatedOrder = await this.prisma.order.update({
      where: { id },
      data: { status: dto.status as any },
      include: {
        user: true,
        items: { include: { vendor: true } },
      },
    });

    // Queue emails for status change (non-blocking)
    this.queueOrderEmails(id, dto.status, previousStatus);

    return updatedOrder;
  }

  private validateStatusTransition(currentStatus: string, newStatus: string): void {
    const validTransitions: Record<string, string[]> = {
      PENDING: ['CONFIRMED', 'CANCELLED'],
      CONFIRMED: ['PROCESSING', 'CANCELLED'],
      PROCESSING: ['SHIPPED', 'CANCELLED'],
      SHIPPED: ['DELIVERED'],
      DELIVERED: ['REFUNDED'],
      REFUNDED: [],
      CANCELLED: [],
    };

    const allowed = validTransitions[currentStatus] || [];
    if (!allowed.includes(newStatus) && currentStatus !== newStatus) {
      throw new BadRequestException(`Cannot transition from ${currentStatus} to ${newStatus}`);
    }
  }

  private async queueOrderEmails(orderId: string, newStatus: string, previousStatus?: string): Promise<void> {
    const order = await this.findById(orderId);

    // Prepare customer email data
    const customerData: OrderEmailData = {
      orderNumber: order.orderNumber,
      customerName: `${order.user.firstName} ${order.user.lastName}`,
      customerEmail: order.user.email,
      status: newStatus,
      previousStatus,
      total: order.total,
      items: order.items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        vendorName: item.vendor?.storeName,
      })),
      orderDate: order.createdAt,
    };

    // Queue customer notification
    await this.emailQueue.addCustomerOrderEmail(customerData);

    // Get unique vendors from order items
    const vendorMap = new Map();
    for (const item of order.items) {
      if (item.vendor && !vendorMap.has(item.vendorId)) {
        vendorMap.set(item.vendorId, item.vendor);
      }
    }
    const vendors = Array.from(vendorMap.values());

    // Queue vendor notifications for relevant status changes
    if (['PENDING', 'CONFIRMED'].includes(newStatus)) {
      for (const vendor of vendors) {
        const vendorItems = order.items.filter(item => item.vendorId === vendor.id);
        const vendorData: VendorEmailData = {
          orderNumber: order.orderNumber,
          vendorName: vendor.storeName,
          vendorEmail: vendor.email || '',
          status: newStatus,
          items: vendorItems.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
          })),
          total: vendorItems.reduce((sum, item) => sum + item.total, 0),
          orderDate: order.createdAt,
        };
        await this.emailQueue.addVendorOrderEmail(vendorData);
      }
    }

    // Queue admin notification
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@crafty.com';
    await this.emailQueue.addAdminOrderEmail({ ...customerData, adminEmail });
  }
}
