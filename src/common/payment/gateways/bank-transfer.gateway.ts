import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  PaymentGateway,
  PaymentResponse,
  PaymentStatus,
  RefundResponse,
} from '../interfaces/payment-gateway.interface';

@Injectable()
export class BankTransferGateway implements PaymentGateway {
  private readonly logger = new Logger(BankTransferGateway.name);

  constructor(private configService: ConfigService) {}

  get name(): string {
    return 'bank_transfer';
  }

  async initializePayment(
    amount: number,
    currency: string = 'USD',
    metadata?: Record<string, any>,
  ): Promise<PaymentResponse> {
    const transactionId = `BT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    this.logger.log(`Bank transfer initialized: ${transactionId}`);

    return {
      transactionId,
      status: 'PENDING',
      redirectUrl: undefined,
      rawResponse: {
        transactionId,
        amount,
        currency,
        instructions: {
          bankName: this.configService.get('BANK_NAME', 'Crafty Bank'),
          accountName: this.configService.get('BANK_ACCOUNT_NAME', 'Crafty E-Commerce'),
          accountNumber: this.configService.get('BANK_ACCOUNT_NUMBER', '1234567890'),
          routingNumber: this.configService.get('BANK_ROUTING_NUMBER', '987654321'),
          iban: this.configService.get('BANK_IBAN', 'XX12345678901234567890'),
          swift: this.configService.get('BANK_SWIFT', 'CRFTYUS33'),
          reference: transactionId,
          deadline: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
        },
        metadata,
      },
    };
  }

  async verifyPayment(transactionId: string): Promise<PaymentStatus> {
    this.logger.log(`Bank transfer verification requested: ${transactionId}`);
    return {
      transactionId,
      status: 'PENDING',
      amount: 0,
      currency: 'USD',
      rawResponse: { message: 'Bank transfer requires manual verification' },
    };
  }

  async refundPayment(transactionId: string, amount?: number): Promise<RefundResponse> {
    const refundId = `REF-${Date.now()}`;
    this.logger.log(`Bank transfer refund requested: ${refundId}`);
    return {
      transactionId,
      refundId,
      status: 'PENDING',
      amount: amount || 0,
      rawResponse: { message: 'Bank transfer refund requires manual processing' },
    };
  }

  async getPaymentLink(transactionId: string): Promise<string> {
    return '';
  }
}
