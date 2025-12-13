import { Injectable, Logger } from '@nestjs/common';
import { maskPhone } from '../../common/pii.util';
import { NotificationProvider } from '../notification-provider';
import { NotificationRequest } from '../notifications.service';

@Injectable()
export class SmsProvider implements NotificationProvider {
  private readonly logger = new Logger(SmsProvider.name);
  private readonly apiKey = process.env.SMS_PROVIDER_API_KEY;

  async send(request: NotificationRequest): Promise<void> {
    const target = maskPhone(request.toPhone);
    if (!this.apiKey) {
      this.logger.warn(
        JSON.stringify({
          event: 'sms.provider.missing_api_key',
          toPhone: target,
        }),
      );
      return;
    }

    this.logger.log(
      JSON.stringify({
        event: 'sms.provider.dispatched',
        toPhone: target,
        subject: request.subject,
      }),
    );
  }
}
