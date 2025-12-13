import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { EmailProvider } from './providers/email.provider';
import { SmsProvider } from './providers/sms.provider';
import { PushProvider } from './providers/push.provider';

@Module({
  providers: [NotificationsService, EmailProvider, SmsProvider, PushProvider],
  exports: [NotificationsService],
})
export class NotificationsModule {}
