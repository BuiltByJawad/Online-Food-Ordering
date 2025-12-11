import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './payment.entity';
import { Order } from '../orders/order.entity';
import { UserRole } from '../users/user-role.enum';
import { AuditService } from '../audit/audit.service';

interface CurrentUserPayload {
  userId: string;
  role: UserRole;
}

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentsRepository: Repository<Payment>,
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    private readonly auditService: AuditService,
  ) {}

  private assertCanAccessOrder(order: Order, user: CurrentUserPayload) {
    if (user.role === UserRole.ADMIN) return;
    if (order.user?.id === user.userId) return;
    throw new ForbiddenException('You do not have access to this order');
  }

  async createPaymentIntent(
    orderId: string,
    user: CurrentUserPayload,
  ): Promise<{
    paymentId: string;
    clientSecret: string;
    amount: number;
    currency: string;
    paymentStatus: string;
  }> {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
      relations: ['user'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    this.assertCanAccessOrder(order, user);

    order.paymentStatus = 'pending';
    await this.ordersRepository.save(order);

    const payment = this.paymentsRepository.create({
      order,
      provider: 'mock',
      providerReference: `mock_pi_${order.id}_${Date.now()}`,
      amount: Number(order.totalAmount),
      currency: 'USD',
      status: 'pending',
    });
    const saved = await this.paymentsRepository.save(payment);
    await this.auditService.record({
      actorId: user.userId,
      actorRole: user.role,
      action: 'payment.intent.create',
      entityType: 'payment',
      entityId: saved.id,
      after: {
        amount: Number(order.totalAmount),
        currency: 'USD',
        orderId: order.id,
        provider: 'mock',
      },
    });

    return {
      paymentId: saved.id,
      clientSecret: `mock_client_secret_${saved.id}`,
      amount: Number(order.totalAmount),
      currency: 'USD',
      paymentStatus: order.paymentStatus,
    };
  }

  async confirmPaymentIntent(
    orderId: string,
    user: CurrentUserPayload,
  ): Promise<{
    status: 'succeeded';
    paymentStatus: string;
  }> {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
      relations: ['user'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    this.assertCanAccessOrder(order, user);

    const payment = await this.paymentsRepository.findOne({
      where: { order: { id: orderId } },
      order: { createdAt: 'DESC' },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found for order');
    }

    payment.status = 'succeeded';
    await this.paymentsRepository.save(payment);

    order.paymentStatus = 'paid';
    await this.ordersRepository.save(order);
    await this.auditService.record({
      actorId: user.userId,
      actorRole: user.role,
      action: 'payment.intent.confirm',
      entityType: 'payment',
      entityId: payment.id,
      before: { status: 'pending' },
      after: { status: 'succeeded', orderPaymentStatus: order.paymentStatus },
    });

    return {
      status: 'succeeded',
      paymentStatus: order.paymentStatus,
    };
  }
}
