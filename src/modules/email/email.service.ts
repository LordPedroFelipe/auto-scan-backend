import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import { EmailSendOptions } from './email.types';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporterPromise: Promise<Transporter | null> | null = null;

  constructor(private readonly configService: ConfigService) {}

  async send(options: EmailSendOptions) {
    const transporter = await this.getTransporter();
    const recipients = Array.isArray(options.to) ? options.to : [options.to];
    const fromName = this.configService.get<string>('MAIL_FROM_NAME', 'ScanDrive');
    const fromEmail = this.configService.get<string>('MAIL_FROM_EMAIL', 'no-reply@scandrive.local');

    if (!transporter) {
      this.logger.warn(
        `SMTP nao configurado. Email "${options.subject}" preparado para ${recipients
          .map((item) => item.email)
          .join(', ')}.`,
      );
      return { delivered: false, provider: 'log-only' as const };
    }

    await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: recipients.map((item) => (item.name ? `"${item.name}" <${item.email}>` : item.email)).join(', '),
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    return { delivered: true, provider: 'smtp' as const };
  }

  private async getTransporter() {
    if (!this.transporterPromise) {
      this.transporterPromise = this.createTransporter();
    }

    return this.transporterPromise;
  }

  private async createTransporter() {
    const host = this.configService.get<string>('SMTP_HOST');
    if (!host) {
      return null;
    }

    const port = Number(this.configService.get<string>('SMTP_PORT', '587'));
    const secure = String(this.configService.get<string>('SMTP_SECURE', 'false')).toLowerCase() === 'true';
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');

    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth: user && pass ? { user, pass } : undefined,
    });
  }
}
