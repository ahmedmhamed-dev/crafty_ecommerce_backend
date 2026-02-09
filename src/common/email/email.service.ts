import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

export interface OrderEmailData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  status: string;
  previousStatus?: string;
  total: number;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    vendorName?: string;
  }>;
  shippingAddress?: string;
  orderDate: Date;
}

export interface VendorEmailData {
  orderNumber: string;
  vendorName: string;
  vendorEmail: string;
  status: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  orderDate: Date;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST', 'smtp.gmail.com'),
      port: this.configService.get<number>('SMTP_PORT', 587),
      secure: false,
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASS'),
      },
    });
  }

  async sendCustomerOrderNotification(data: OrderEmailData): Promise<void> {
    const html = this.getCustomerEmailTemplate(data);
    await this.sendEmail({
      to: data.customerEmail,
      subject: `Order ${data.orderNumber} - ${this.getStatusMessage(data.status)}`,
      html,
    });
  }

  async sendVendorOrderNotification(data: VendorEmailData): Promise<void> {
    const html = this.getVendorEmailTemplate(data);
    await this.sendEmail({
      to: data.vendorEmail,
      subject: `New Order ${data.orderNumber} - Action Required`,
      html,
    });
  }

  async sendAdminOrderNotification(data: OrderEmailData & { adminEmail: string }): Promise<void> {
    const html = this.getAdminEmailTemplate(data);
    await this.sendEmail({
      to: data.adminEmail,
      subject: `Order ${data.orderNumber} - Status Changed to ${data.status}`,
      html,
    });
  }

  private async sendEmail(options: { to: string; subject: string; html: string }): Promise<void> {
    try {
      const fromName = this.configService.get('FROM_NAME', 'Crafty E-Commerce');
      const fromEmail = this.configService.get('FROM_EMAIL', 'noreply@crafty.com');
      await this.transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
      });
      this.logger.log(`Email sent to ${options.to}: ${options.subject}`);
    } catch (error: any) {
      this.logger.error(`Failed to send email: ${error?.message || 'Unknown error'}`);
    }
  }

  private getStatusMessage(status: string): string {
    const messages: Record<string, string> = {
      PENDING: 'Order Received',
      CONFIRMED: 'Order Confirmed',
      PROCESSING: 'Being Prepared',
      SHIPPED: 'On the Way',
      DELIVERED: 'Delivered',
      CANCELLED: 'Cancelled',
      REFUNDED: 'Refunded',
    };
    return messages[status] || status;
  }

  private getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      PENDING: '#f39c12',
      CONFIRMED: '#3498db',
      PROCESSING: '#9b59b6',
      SHIPPED: '#e67e22',
      DELIVERED: '#27ae60',
      CANCELLED: '#e74c3c',
      REFUNDED: '#95a5a6',
    };
    return colors[status] || '#667eea';
  }

  private getCustomerEmailTemplate(data: OrderEmailData): string {
    const statusColor = this.getStatusColor(data.status);
    const itemsList = data.items.map(item => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.name}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">$${item.price.toFixed(2)}</td>
      </tr>`).join('');

    return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Order Update</title></head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', sans-serif; background-color: #f5f5f5;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
<tr><td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
<h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">Crafty E-Commerce</h1>
<p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">Your Trusted Shopping Destination</p>
</td></tr>
<tr><td style="padding: 40px 30px;">
<h2 style="color: #333; margin: 0 0 20px 0; font-size: 24px;">Hi ${data.customerName},</h2>
<div style="background: ${statusColor}15; border-left: 4px solid ${statusColor}; padding: 20px; margin-bottom: 30px; border-radius: 0 8px 8px 0;">
<p style="margin: 0; color: ${statusColor}; font-size: 18px; font-weight: 600;">${this.getStatusMessage(data.status)}</p>
<p style="margin: 8px 0 0 0; color: #666; font-size: 14px;">Order #${data.orderNumber}</p>
</div>
<table width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 30px; border-collapse: collapse;">
<thead><tr style="background-color: #f8f9fa;">
<th style="padding: 12px; text-align: left; font-weight: 600; color: #555;">Product</th>
<th style="padding: 12px; text-align: center; font-weight: 600; color: #555;">Qty</th>
<th style="padding: 12px; text-align: right; font-weight: 600; color: #555;">Price</th>
</tr></thead>
<tbody>${itemsList}</tbody>
<tfoot><tr>
<td colspan="2" style="padding: 12px; text-align: right; font-weight: 600; color: #333;">Total</td>
<td style="padding: 12px; text-align: right; font-weight: 700; color: #667eea; font-size: 18px;">$${data.total.toFixed(2)}</td>
</tr></tfoot>
</table>
<div style="text-align: center; padding: 20px;">
<a href="${this.configService.get('FRONTEND_URL', 'http://localhost:3000')}/orders/${data.orderNumber}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 14px 30px; border-radius: 8px; font-weight: 600; font-size: 14px;">View Order Details</a>
</div>
</td></tr>
<tr><td style="background-color: #f8f9fa; padding: 30px; text-align: center;">
<p style="margin: 0 0 10px 0; color: #999; font-size: 12px;">Thank you for shopping with us!</p>
<p style="margin: 0; color: #ccc; font-size: 11px;">&copy; ${new Date().getFullYear()} Crafty E-Commerce. All rights reserved.</p>
</td></tr>
</table></body></html>`;
  }

  private getVendorEmailTemplate(data: VendorEmailData): string {
    const itemsList = data.items.map(item => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.name}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">$${item.price.toFixed(2)}</td>
      </tr>`).join('');

    return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>New Order</title></head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', sans-serif; background-color: #f5f5f5;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
<tr><td style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); padding: 30px; text-align: center;">
<h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">${data.vendorName}</h1>
<p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">Vendor Dashboard</p>
</td></tr>
<tr><td style="padding: 40px 30px;">
<h2 style="color: #333; margin: 0 0 20px 0; font-size: 24px;">New Order Received!</h2>
<div style="background: #e8f5e9; border: 1px solid #c8e6c9; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
<p style="margin: 0 0 5px 0; color: #2e7d32; font-size: 24px; font-weight: 700;">Order #${data.orderNumber}</p>
<p style="margin: 0; color: #666; font-size: 14px;">Placed on ${data.orderDate.toLocaleDateString()}</p>
</div>
<table width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 30px; border-collapse: collapse;">
<thead><tr style="background-color: #f8f9fa;">
<th style="padding: 12px; text-align: left; font-weight: 600; color: #555;">Product</th>
<th style="padding: 12px; text-align: center; font-weight: 600; color: #555;">Qty</th>
<th style="padding: 12px; text-align: right; font-weight: 600; color: #555;">Price</th>
</tr></thead>
<tbody>${itemsList}</tbody>
<tfoot><tr>
<td colspan="2" style="padding: 12px; text-align: right; font-weight: 600; color: #333;">Order Total</td>
<td style="padding: 12px; text-align: right; font-weight: 700; color: #11998e; font-size: 18px;">$${data.total.toFixed(2)}</td>
</tr></tfoot>
</table>
<div style="background: #fff3e0; border-left: 4px solid #ff9800; padding: 15px 20px; margin-bottom: 30px; border-radius: 0 8px 8px 0;">
<p style="margin: 0; color: #e65100; font-size: 14px;">Please process this order as soon as possible</p>
</div>
<div style="text-align: center; padding: 20px;">
<a href="${this.configService.get('VENDOR_DASHBOARD_URL', 'http://localhost:3000/vendor/orders')}" style="display: inline-block; background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: #ffffff; text-decoration: none; padding: 14px 30px; border-radius: 8px; font-weight: 600; font-size: 14px;">Process Order</a>
</div>
</td></tr>
<tr><td style="background-color: #f8f9fa; padding: 30px; text-align: center;">
<p style="margin: 0 0 10px 0; color: #999; font-size: 12px;">This is an automated message from Crafty E-Commerce</p>
<p style="margin: 0; color: #ccc; font-size: 11px;">&copy; ${new Date().getFullYear()} Crafty E-Commerce. All rights reserved.</p>
</td></tr>
</table></body></html>`;
  }

  private getAdminEmailTemplate(data: OrderEmailData): string {
    const statusColor = this.getStatusColor(data.status);
    return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Admin Order Alert</title></head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', sans-serif; background-color: #1a1a2e;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background-color: #16213e;">
<tr><td style="background: #0f3460; padding: 30px; text-align: center; border-bottom: 3px solid #e94560;">
<h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">Admin Dashboard</h1>
<p style="color: rgba(255,255,255,0.7); margin: 10px 0 0 0; font-size: 14px;">Crafty E-Commerce</p>
</td></tr>
<tr><td style="padding: 40px 30px;">
<h2 style="color: #ffffff; margin: 0 0 20px 0; font-size: 24px;">Order Status Update</h2>
<div style="background: rgba(255,255,255,0.1); padding: 25px; border-radius: 12px; margin-bottom: 30px;">
<table width="100%">
<tr><td style="padding: 8px 0; color: #aaa; font-size: 14px;">Order Number</td>
<td style="padding: 8px 0; color: #ffffff; font-weight: 600; text-align: right; font-size: 16px;">#${data.orderNumber}</td></tr>
<tr><td style="padding: 8px 0; color: #aaa; font-size: 14px;">Customer</td>
<td style="padding: 8px 0; color: #ffffff; text-align: right; font-size: 14px;">${data.customerName} (${data.customerEmail})</td></tr>
<tr><td style="padding: 8px 0; color: #aaa; font-size: 14px;">Previous Status</td>
<td style="padding: 8px 0; color: #ffd700; text-align: right; font-size: 14px;">${data.previousStatus || 'N/A'}</td></tr>
<tr><td style="padding: 8px 0; color: #aaa; font-size: 14px;">New Status</td>
<td style="padding: 8px 0; color: ${statusColor}; font-weight: 600; text-align: right; font-size: 14px;">${data.status}</td></tr>
<tr><td style="padding: 8px 0; color: #aaa; font-size: 14px;">Order Total</td>
<td style="padding: 8px 0; color: #ffffff; font-weight: 600; text-align: right; font-size: 16px;">$${data.total.toFixed(2)}</td></tr>
</table></div>
<div style="text-align: center; padding: 20px;">
<a href="${this.configService.get('ADMIN_DASHBOARD_URL', 'http://localhost:3000/admin/orders')}" style="display: inline-block; background: linear-gradient(135deg, #e94560 0%, #0f3460 100%); color: #ffffff; text-decoration: none; padding: 14px 30px; border-radius: 8px; font-weight: 600; font-size: 14px;">View Order</a>
</div>
</td></tr>
<tr><td style="background: #0f3460; padding: 20px; text-align: center;">
<p style="margin: 0; color: #888; font-size: 11px;">Admin notification - Order ${data.orderNumber}</p>
</td></tr>
</table></body></html>`;
  }
}
