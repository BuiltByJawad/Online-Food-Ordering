import { Injectable, Logger } from '@nestjs/common';
import { maskEmail } from '../../common/pii.util';
import { NotificationProvider } from '../notification-provider';
import { NotificationRequest } from '../notifications.service';

@Injectable()
export class EmailProvider implements NotificationProvider {
  private readonly logger = new Logger(EmailProvider.name);
  private readonly apiKey = process.env.EMAIL_PROVIDER_API_KEY;

  async send(request: NotificationRequest): Promise<void> {
    const target = maskEmail(request.toEmail);
    if (!this.apiKey) {
      this.logger.warn(
        JSON.stringify({
          event: 'email.provider.missing_api_key',
          toEmail: target,
        }),
      );
      return;
    }

    this.logger.log(
      JSON.stringify({
        event: 'email.provider.dispatched',
        toEmail: target,
        subject: request.subject,
      }),
    );
  }
}
