import { Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import { Order } from './order.entity';

@WebSocketGateway({
  namespace: 'orders',
  cors: { origin: true, credentials: true },
})
export class OrdersEventsGateway implements OnGatewayConnection {
  private readonly logger = new Logger(OrdersEventsGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  @WebSocketServer()
  server: Server;

  async handleConnection(client: Socket) {
    try {
      const token =
        (client.handshake.auth as any)?.token ||
        client.handshake.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        throw new UnauthorizedException('Missing token');
      }

      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      });

      client.data.userId = payload.sub;
      client.data.role = payload.role;
    } catch (err) {
      this.logger.warn(`Disconnecting socket: ${err?.message ?? 'unauthorized'}`);
      client.disconnect(true);
    }
  }

  emitStatusUpdated(order: Order) {
    this.server?.emit('order.status.updated', {
      orderId: order.id,
      status: order.status,
      riderId: order.rider?.id ?? null,
    });
  }

  emitRiderAssigned(order: Order) {
    this.server?.emit('order.rider.assigned', {
      orderId: order.id,
      riderId: order.rider?.id ?? null,
    });
  }
}
