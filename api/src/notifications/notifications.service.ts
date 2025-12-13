import { Injectable, Logger } from '@nestjs/common';
import { maskEmail, maskPhone } from '../common/pii.util';
import { EmailProvider } from './providers/email.provider';
import { SmsProvider } from './providers/sms.provider';
import { PushProvider } from './providers/push.provider';

export type NotificationChannel = 'email' | 'sms' | 'push';

export interface NotificationRequest {
  toUserId?: string;
  toEmail?: string | null;
  toPhone?: string | null;
  channels: NotificationChannel[];
  subject: string;
  body: string;
  meta?: Record<string, any>;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly emailProvider: EmailProvider,
    private readonly smsProvider: SmsProvider,
    private readonly pushProvider: PushProvider,
  ) {}

  async send(request: NotificationRequest): Promise<void> {
    this.logger.log(
      JSON.stringify({
        event: 'notification.dispatch',
        channels: request.channels,
        toUserId: request.toUserId,
        toEmail: maskEmail(request.toEmail),
        toPhone: maskPhone(request.toPhone),
        subject: request.subject,
        meta: request.meta,
      }),
    );

    const tasks: Promise<void>[] = [];
    if (request.channels.includes('email') && request.toEmail) {
      tasks.push(this.emailProvider.send(request));
    }
    if (request.channels.includes('sms') && request.toPhone) {
      tasks.push(this.smsProvider.send(request));
    }
    if (request.channels.includes('push')) {
      tasks.push(this.pushProvider.send(request));
    }

    await Promise.all(tasks);
  }
}
