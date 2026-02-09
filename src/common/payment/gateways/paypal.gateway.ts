import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  PaymentGateway,
  PaymentResponse,
  PaymentStatus,
  RefundResponse,
} from '../interfaces/payment-gateway.interface';

@Injectable()
export class PayPalGateway implements PaymentGateway {
  private readonly logger = new Logger(PayPalGateway.name);

  constructor(private configService: ConfigService) {}

  get name(): string {
    return 'paypal';
  }

  async initializePayment(
    amount: number,
    currency: string = 'USD',
    metadata?: Record<string, any>,
  ): Promise<PaymentResponse> {
    const transactionId = `PP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    this.logger.log(`PayPal order created: ${transactionId}`);

    return {
      transactionId,
      status: 'PENDING',
      redirectUrl: `https://www.sandbox.paypal.com/checkoutnow?token=${transactionId}`,
      rawResponse: {
        orderId: transactionId,
        amount,
        currency,
        description: metadata?.description || `Order ${metadata?.orderId}`,
        status: 'CREATED',
      },
    };
  }

  async verifyPayment(transactionId: string): Promise<PaymentStatus> {
    this.logger.log(`PayPal order captured: ${transactionId}`);

    return {
      transactionId,
      status: 'PENDING',
      amount: 0,
      currency: 'USD',
      rawResponse: { message: 'PayPal verification requires API credentials' },
    };
  }

  async refundPayment(transactionId: string, amount?: number): Promise<RefundResponse> {
    const refundId = `REF-${Date.now()}`;
    this.logger.log(`PayPal refund processed: ${refundId}`);

    return {
      transactionId,
      refundId,
      status: 'PENDING',
      amount: amount || 0,
      rawResponse: { message: 'PayPal refund requires API credentials' },
    };
  }

  async getPaymentLink(transactionId: string): Promise<string> {
    return `https://www.sandbox.paypal.com/checkoutnow?token=${transactionId}`;
  }
}
