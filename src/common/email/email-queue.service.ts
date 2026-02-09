import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue, Worker } from 'bullmq';
import { EmailService, OrderEmailData, VendorEmailData } from './email.service';

export { OrderEmailData, VendorEmailData };

@Injectable()
export class EmailQueueService implements OnModuleDestroy {
  private readonly logger = new Logger(EmailQueueService.name);
  private readonly emailQueue: Queue;
  private emailWorker: Worker | null = null;
  private readonly emailService: EmailService;

  constructor(
    private configService: ConfigService,
    emailService: EmailService,
  ) {
    this.emailService = emailService;

    this.emailQueue = new Queue('email', {
      connection: {
        host: this.configService.get('REDIS_HOST', 'localhost'),
        port: this.configService.get<number>('REDIS_PORT', 6379),
        password: this.configService.get('REDIS_PASSWORD') || undefined,
        db: this.configService.get<number>('REDIS_DB', 0),
      },
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
        removeOnComplete: 100,
        removeOnFail: 50,
      },
    });

    // Create worker to process emails
    this.emailWorker = new Worker('email', async (job) => {
      const { type, data } = job.data;
      this.logger.log(`Processing email job ${job.id} of type ${type}`);
      
      switch (type) {
        case 'customer-order':
          await this.emailService.sendCustomerOrderNotification(data as OrderEmailData);
          break;
        case 'vendor-order':
          await this.emailService.sendVendorOrderNotification(data as VendorEmailData);
          break;
        case 'admin-order':
          await this.emailService.sendAdminOrderNotification(data as OrderEmailData & { adminEmail: string });
          break;
        default:
          this.logger.warn(`Unknown email job type: ${type}`);
      }
    }, {
      connection: {
        host: this.configService.get('REDIS_HOST', 'localhost'),
        port: this.configService.get<number>('REDIS_PORT', 6379),
        password: this.configService.get('REDIS_PASSWORD') || undefined,
        db: this.configService.get<number>('REDIS_DB', 0),
      },
    });

    this.emailWorker.on('completed', (job) => {
      this.logger.log(`Email job ${job.id} completed`);
    });

    this.emailWorker.on('failed', (job, err) => {
      this.logger.error(`Email job ${job?.id} failed: ${err.message}`);
    });
  }

  async onModuleDestroy() {
    if (this.emailWorker) {
      await this.emailWorker.close();
    }
    await this.emailQueue.close();
  }

  async addCustomerOrderEmail(data: OrderEmailData): Promise<void> {
    await this.emailQueue.add('customer-order', {
      type: 'customer-order',
      data,
      jobId: `customer-${data.orderNumber}-${Date.now()}`,
    });
    this.logger.log(`Queued customer email for order ${data.orderNumber}`);
  }

  async addVendorOrderEmail(data: VendorEmailData): Promise<void> {
    await this.emailQueue.add('vendor-order', {
      type: 'vendor-order',
      data,
      jobId: `vendor-${data.orderNumber}-${Date.now()}`,
    });
    this.logger.log(`Queued vendor email for order ${data.orderNumber}`);
  }

  async addAdminOrderEmail(data: OrderEmailData & { adminEmail: string }): Promise<void> {
    await this.emailQueue.add('admin-order', {
      type: 'admin-order',
      data,
      jobId: `admin-${data.orderNumber}-${Date.now()}`,
    });
    this.logger.log(`Queued admin email for order ${data.orderNumber}`);
  }

  async getQueueStats(): Promise<{ waiting: number; active: number; completed: number; failed: number }> {
    const [waiting, active, completed, failed] = await Promise.all([
      this.emailQueue.getWaitingCount(),
      this.emailQueue.getActiveCount(),
      this.emailQueue.getCompletedCount(),
      this.emailQueue.getFailedCount(),
    ]);
    return { waiting, active, completed, failed };
  }
}
