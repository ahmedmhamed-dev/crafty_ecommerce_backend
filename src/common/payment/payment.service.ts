import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { StripeGateway } from './gateways/stripe.gateway';
import { PayPalGateway } from './gateways/paypal.gateway';
import { BankTransferGateway } from './gateways/bank-transfer.gateway';
import {
  PaymentGateway,
  PaymentResponse,
  PaymentStatus,
  RefundResponse,
  CreatePaymentDto,
} from './interfaces/payment-gateway.interface';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private readonly gateways: Map<string, PaymentGateway> = new Map();

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private stripeGateway: StripeGateway,
    private paypalGateway: PayPalGateway,
    private bankTransferGateway: BankTransferGateway,
  ) {
    this.gateways.set('stripe', this.stripeGateway);
    this.gateways.set('paypal', this.paypalGateway);
    this.gateways.set('bank_transfer', this.bankTransferGateway);
  }

  getGateway(method: string): PaymentGateway {
    const gateway = this.gateways.get(method);
    if (!gateway) {
      throw new NotFoundException(`Payment method ${method} not supported`);
    }
    return gateway;
  }

  async createPayment(dto: CreatePaymentDto): Promise<PaymentResponse> {
    const gateway = this.getGateway(dto.method);

    const order = await this.prisma.order.findUnique({
      where: { id: dto.orderId },
      include: {
        user: true,
        items: { include: { product: true } },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const response = await gateway.initializePayment(
      dto.amount || order.total,
      dto.currency || 'USD',
      {
        orderId: order.orderNumber,
        productName: 'Crafty E-Commerce Order',
        description: `Order #${order.orderNumber}`,
        returnUrl: dto.returnUrl,
        cancelUrl: dto.cancelUrl,
      },
    );

    await this.prisma.payment.create({
      data: {
        orderId: dto.orderId,
        method: dto.method,
        amount: dto.amount || order.total,
        currency: dto.currency || 'USD',
        transactionId: response.transactionId,
        status: 'PENDING',
        paymentData: JSON.stringify(response.rawResponse),
      },
    });

    this.logger.log(`Payment created via ${dto.method}: ${response.transactionId}`);

    return response;
  }

  async verifyPayment(transactionId: string, method: string): Promise<PaymentStatus> {
    const gateway = this.getGateway(method);
    const status = await gateway.verifyPayment(transactionId);

    const payment = await this.prisma.payment.findFirst({
      where: { transactionId },
    });

    if (payment) {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: status.status as any,
          paidAt: status.paidAt,
          paymentData: JSON.stringify(status.rawResponse),
        },
      });

      if (status.status === 'COMPLETED') {
        await this.prisma.order.update({
          where: { id: payment.orderId },
          data: { status: 'CONFIRMED' },
        });
      }
    }

    this.logger.log(`Payment verified: ${transactionId} - ${status.status}`);

    return status;
  }

  async refundPayment(transactionId: string, method: string, amount?: number): Promise<RefundResponse> {
    const gateway = this.getGateway(method);
    const response = await gateway.refundPayment(transactionId, amount);

    const payment = await this.prisma.payment.findFirst({
      where: { transactionId },
    });

    if (payment) {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'REFUNDED',
          paymentData: JSON.stringify(response.rawResponse),
        },
      });
    }

    this.logger.log(`Payment refunded: ${transactionId} - ${response.status}`);

    return response;
  }

  async getPaymentByOrder(orderId: string) {
    return this.prisma.payment.findUnique({
      where: { orderId },
    });
  }

  async handleStripeWebhook(payload: Buffer, signature: string): Promise<{ handled: boolean }> {
    return this.stripeGateway.handleWebhook(payload, signature);
  }

  async getAvailableMethods(): Promise<{ name: string; label: string }[]> {
    return [
      { name: 'stripe', label: 'Credit/Debit Card (Stripe)' },
      { name: 'paypal', label: 'PayPal' },
      { name: 'bank_transfer', label: 'Bank Transfer' },
    ];
  }
}
