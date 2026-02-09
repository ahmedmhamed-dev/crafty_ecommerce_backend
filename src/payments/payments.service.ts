import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async createPayment(orderId: string, method: string, amount: number) {
    return this.prisma.payment.create({
      data: { orderId, method, amount, status: 'PENDING' },
    });
  }

  async updatePayment(id: string, status: string, transactionId?: string) {
    return this.prisma.payment.update({
      where: { id },
      data: {
        status: status as any,
        transactionId,
        paidAt: status === 'COMPLETED' ? new Date() : undefined,
      },
    });
  }

  async getPaymentByOrder(orderId: string) {
    return this.prisma.payment.findUnique({ where: { orderId } });
  }
}
