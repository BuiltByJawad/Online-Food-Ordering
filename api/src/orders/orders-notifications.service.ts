import { Injectable, Logger } from '@nestjs/common';
import { Order } from './order.entity';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class OrdersNotificationsService {
  private readonly logger = new Logger(OrdersNotificationsService.name);

  constructor(private readonly notificationsService: NotificationsService) {}

  async notifyStatusChange(order: Order): Promise<void> {
    const subject = `Order ${order.id} is now ${order.status}`;
    const body = `Order ${order.id} status changed to ${order.status}.`;
    const tasks: Promise<void>[] = [];

    if (order.user) {
      tasks.push(
        this.notificationsService.send({
          toUserId: order.user.id,
          toEmail: (order.user as any).email ?? null,
          toPhone: (order.user as any).phone ?? null,
          channels: ['email', 'push'],
          subject,
          body,
          meta: { orderId: order.id, status: order.status },
        }),
      );
    }

    if (order.rider) {
      tasks.push(
        this.notificationsService.send({
          toUserId: order.rider.id,
          toEmail: (order.rider as any).email ?? null,
          toPhone: (order.rider as any).phone ?? null,
          channels: ['email', 'push'],
          subject,
          body,
          meta: { orderId: order.id, status: order.status },
        }),
      );
    }

    await Promise.all(tasks);

    this.logger.log(
      JSON.stringify({
        event: 'order.status.notification.dispatched',
        orderId: order.id,
        status: order.status,
        customerNotified: Boolean(order.user),
        riderNotified: Boolean(order.rider),
      }),
    );
  }
}
