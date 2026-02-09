export interface PaymentGateway {
  name: string;
  initializePayment(amount: number, currency: string, metadata?: Record<string, any>): Promise<PaymentResponse>;
  verifyPayment(transactionId: string): Promise<PaymentStatus>;
  refundPayment(transactionId: string, amount?: number): Promise<RefundResponse>;
  getPaymentLink(transactionId: string): Promise<string>;
}

export interface PaymentResponse {
  transactionId: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  redirectUrl?: string;
  rawResponse?: any;
}

export interface PaymentStatus {
  transactionId: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  amount: number;
  currency: string;
  paidAt?: Date;
  rawResponse?: any;
}

export interface RefundResponse {
  transactionId: string;
  refundId: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  amount: number;
  rawResponse?: any;
}

export interface CreatePaymentDto {
  orderId: string;
  method: 'stripe' | 'paypal' | 'bank_transfer';
  amount: number;
  currency?: string;
  returnUrl?: string;
  cancelUrl?: string;
}

export interface PaymentCallbackDto {
  transactionId: string;
  status: string;
  rawData: any;
}
