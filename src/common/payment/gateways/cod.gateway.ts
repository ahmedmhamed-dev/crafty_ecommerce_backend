import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  PaymentGateway,
  PaymentResponse,
  PaymentStatus,
  RefundResponse,
} from '../interfaces/payment-gateway.interface';

@Injectable()
export class CodGateway implements PaymentGateway {
  private readonly logger = new Logger(CodGateway.name);

  constructor(private configService: ConfigService) {}

  get name(): string {
    return 'cod';
  }

  async initializePayment(
    amount: number,
    currency: string = 'USD',
    metadata?: Record<string, any>,
  ): Promise<PaymentResponse> {
    const transactionId = `COD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    this.logger.log(`Cash on Delivery payment initialized: ${transactionId}`);

    return {
      transactionId,
      status: 'PENDING',
      redirectUrl: undefined,
      rawResponse: {
        transactionId,
        amount,
        currency,
        method: 'cash_on_delivery',
        instructions: {
          message: 'Pay when your order is delivered',
          paymentLocation: 'At your doorstep',
          acceptedCurrencies: ['USD', 'EUR', 'GBP', 'EGP'],
          notes: [
            'Please have the exact amount ready if possible',
            'Payment can be made in cash or via mobile payment',
            'The delivery person will provide a receipt',
          ],
          confirmedBy: 'Delivery confirmation code',
        },
        orderId: metadata?.orderId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
        metadata,
      },
    };
  }

  async verifyPayment(transactionId: string): Promise<PaymentStatus> {
    // COD payments are verified when the delivery is confirmed
    // This would typically check a delivery confirmation
    this.logger.log(`COD verification requested: ${transactionId}`);

    return {
      transactionId,
      status: 'PENDING',
      amount: 0,
      currency: 'USD',
      rawResponse: {
        message: 'COD payment will be verified upon delivery',
        instruction: 'Update payment status when order is delivered',
      },
    };
  }

  async confirmPayment(transactionId: string, deliveryCode?: string): Promise<PaymentStatus> {
    // Confirm COD payment when delivered
    this.logger.log(`COD payment confirmed: ${transactionId} with code: ${deliveryCode}`);

    return {
      transactionId,
      status: 'COMPLETED',
      amount: 0,
      currency: 'USD',
      paidAt: new Date(),
      rawResponse: {
        message: 'Payment collected successfully',
        deliveryCode,
        confirmedAt: new Date().toISOString(),
      },
    };
  }

  async refundPayment(transactionId: string, amount?: number): Promise<RefundResponse> {
    // COD refunds are processed manually or via bank transfer
    const refundId = `COD-REF-${Date.now()}`;

    this.logger.log(`COD refund initiated: ${refundId} for ${transactionId}`);

    return {
      transactionId,
      refundId,
      status: 'PENDING',
      amount: amount || 0,
      rawResponse: {
        message: 'COD refund requires manual processing',
        instruction: 'Process refund via bank transfer or cash',
        refundId,
        initiatedAt: new Date().toISOString(),
      },
    };
  }

  async getPaymentLink(transactionId: string): Promise<string> {
    // COD doesn't have a payment link
    return '';
  }

  async getInstructions(transactionId: string): Promise<{
    instructions: string[];
    expiresAt: string;
  }> {
    return {
      instructions: [
        'Pay when your order is delivered',
        'Payment can be made in cash or via mobile payment',
        'Please have the exact amount ready if possible',
        'The delivery person will provide a receipt',
        'Provide the delivery confirmation code upon payment',
      ],
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };
  }
}
