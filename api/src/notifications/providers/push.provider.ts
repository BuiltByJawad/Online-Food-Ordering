import { Injectable, Logger } from '@nestjs/common';
import { NotificationProvider } from '../notification-provider';
import { NotificationRequest } from '../notifications.service';

@Injectable()
export class PushProvider implements NotificationProvider {
  private readonly logger = new Logger(PushProvider.name);
  private readonly apiKey = process.env.PUSH_PROVIDER_API_KEY;

  async send(request: NotificationRequest): Promise<void> {
    if (!this.apiKey) {
      this.logger.warn(
        JSON.stringify({
          event: 'push.provider.missing_api_key',
          toUserId: request.toUserId ?? null,
        }),
      );
      return;
    }

    this.logger.log(
      JSON.stringify({
        event: 'push.provider.dispatched',
        toUserId: request.toUserId ?? null,
        subject: request.subject,
      }),
    );
  }
}
