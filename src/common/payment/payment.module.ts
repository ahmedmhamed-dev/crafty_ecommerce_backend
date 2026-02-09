import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { PaymentService } from './payment.service';
import { StripeGateway } from './gateways/stripe.gateway';
import { PayPalGateway } from './gateways/paypal.gateway';
import { BankTransferGateway } from './gateways/bank-transfer.gateway';
import { CodGateway } from './gateways/cod.gateway';

@Module({
  imports: [PrismaModule, ConfigModule],
  providers: [PaymentService, StripeGateway, PayPalGateway, BankTransferGateway, CodGateway],
  exports: [PaymentService],
})
export class PaymentModule {}
