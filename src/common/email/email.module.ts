import { Module, forwardRef } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailQueueService } from './email-queue.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [EmailService, EmailQueueService],
  exports: [EmailService, EmailQueueService],
})
export class EmailModule {}
