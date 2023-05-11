import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailService } from '@sendgrid/mail';
import { AppConfig } from '@/common/config';

@Injectable()
export class EmailService {
  private mail: MailService;
  constructor(private readonly configService: ConfigService<AppConfig>) {
    this.mail = new MailService();
    this.mail.setApiKey(this.configService.get('sendgrid').apiKey);
  }

  async sendEmail(options: {
    to: string;
    subject: string;
    html: string;
    from?: string;
  }) {
    const { to, subject, html, from } = options;
    const msg = {
      to,
      from: from || this.configService.get('email').from,
      subject,
      html,
    };
    await this.mail.send(msg);
  }
}
