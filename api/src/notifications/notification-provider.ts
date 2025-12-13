import { NotificationRequest } from './notifications.service';

export interface NotificationProvider {
  send(request: NotificationRequest): Promise<void>;
}
