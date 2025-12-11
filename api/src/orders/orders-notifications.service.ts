import { Injectable, Logger } from '@nestjs/common';
import { Order } from './order.entity';

@Injectable()
export class OrdersNotificationsService {
  private readonly logger = new Logger(OrdersNotificationsService.name);

  async notifyStatusChange(order: Order): Promise<void> {
    this.logger.log(
      `Notify status change → order ${order.id} now ${order.status} (customer: ${
        order.user?.id ?? 'unknown'
      }, rider: ${order.rider?.id ?? 'none'})`,
    );
    // Placeholder for future email/push integration
  }
}
