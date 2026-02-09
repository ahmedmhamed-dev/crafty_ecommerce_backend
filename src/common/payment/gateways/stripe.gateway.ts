import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import {
  PaymentGateway,
  PaymentResponse,
  PaymentStatus,
  RefundResponse,
} from '../interfaces/payment-gateway.interface';

@Injectable()
export class StripeGateway implements PaymentGateway {
  private readonly logger = new Logger(StripeGateway.name);
  private stripe: Stripe;

  constructor(private configService: ConfigService) {
    this.stripe = new Stripe(this.configService.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2025-01-27.acacia' as any,
    });
  }

  get name(): string {
    return 'stripe';
  }

  async initializePayment(
    amount: number,
    currency: string = 'usd',
    metadata?: Record<string, any>,
  ): Promise<PaymentResponse> {
    try {
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency,
              product_data: {
                name: metadata?.productName || 'Crafty E-Commerce Order',
                description: metadata?.description || `Order ${metadata?.orderId}`,
              },
              unit_amount: Math.round(amount * 100),
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: metadata?.returnUrl || `${this.configService.get('FRONTEND_URL')}/payment/success`,
        cancel_url: metadata?.cancelUrl || `${this.configService.get('FRONTEND_URL')}/payment/cancel`,
        metadata: {
          orderId: metadata?.orderId || '',
          ...metadata,
        },
      });

      this.logger.log(`Stripe session created: ${session.id}`);

      return {
        transactionId: session.id,
        status: 'PENDING',
        redirectUrl: session.url || undefined,
        rawResponse: session,
      };
    } catch (error: any) {
      this.logger.error(`Stripe initialization failed: ${error.message}`);
      throw error;
    }
  }

  async verifyPayment(transactionId: string): Promise<PaymentStatus> {
    try {
      const session = await this.stripe.checkout.sessions.retrieve(transactionId);

      let status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED' = 'PENDING';
      if (session.payment_status === 'paid') {
        status = 'COMPLETED';
      } else if (session.status === 'expired') {
        status = 'FAILED';
      }

      return {
        transactionId: session.id,
        status,
        amount: session.amount_total ? session.amount_total / 100 : 0,
        currency: session.currency?.toUpperCase() || 'USD',
        paidAt: session.payment_status === 'paid' ? new Date(session.created * 1000) : undefined,
        rawResponse: session,
      };
    } catch (error: any) {
      this.logger.error(`Stripe verification failed: ${error.message}`);
      throw error;
    }
  }

  async refundPayment(transactionId: string, amount?: number): Promise<RefundResponse> {
    try {
      const session = await this.stripe.checkout.sessions.retrieve(transactionId);
      
      const refundParams: Stripe.RefundCreateParams = {
        payment_intent: session.payment_intent as string,
      };
      
      if (amount) {
        refundParams.amount = Math.round(amount * 100);
      }

      const refund = await this.stripe.refunds.create(refundParams);

      this.logger.log(`Stripe refund created: ${refund.id}`);

      return {
        transactionId: transactionId,
        refundId: refund.id,
        status: refund.status === 'succeeded' ? 'COMPLETED' : 'PENDING',
        amount: refund.amount ? refund.amount / 100 : 0,
        rawResponse: refund,
      };
    } catch (error: any) {
      this.logger.error(`Stripe refund failed: ${error.message}`);
      throw error;
    }
  }

  async getPaymentLink(transactionId: string): Promise<string> {
    const session = await this.stripe.checkout.sessions.retrieve(transactionId);
    return session.url || '';
  }

  async handleWebhook(payload: Buffer, signature: string): Promise<{ handled: boolean; event?: any }> {
    try {
      const webhookSecret = this.configService.get('STRIPE_WEBHOOK_SECRET');
      const event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret || '');

      this.logger.log(`Stripe webhook received: ${event.type}`);

      return { handled: true, event };
    } catch (error: any) {
      this.logger.error(`Stripe webhook verification failed: ${error.message}`);
      return { handled: false };
    }
  }
}
