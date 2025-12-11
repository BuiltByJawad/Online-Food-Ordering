import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './order.entity';
import { MenuItem } from '../menu/menu-item.entity';
import { Address } from '../addresses/address.entity';
import { Branch } from '../vendors/branch.entity';
import { UserRole } from '../users/user-role.enum';
import { CreateOrderDto } from './dto/create-order.dto';
import { UsersService } from '../users/users.service';
import { OrdersNotificationsService } from './orders-notifications.service';
import { PaymentsService } from '../payments/payments.service';
import { AuditService } from '../audit/audit.service';
interface CurrentUserPayload {
  userId: string;
  role: UserRole;
}

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    @InjectRepository(MenuItem)
    private readonly itemsRepository: Repository<MenuItem>,
    @InjectRepository(Address)
    private readonly addressesRepository: Repository<Address>,
    @InjectRepository(Branch)
    private readonly branchesRepository: Repository<Branch>,
    private readonly usersService: UsersService,
    private readonly ordersNotificationsService: OrdersNotificationsService,
    private readonly paymentsService: PaymentsService,
    private readonly auditService: AuditService,
  ) {}

  async createForUser(userId: string, dto: CreateOrderDto): Promise<Order> {
    const lines: Order['items'] = [];
    let total = 0;
    const branchId = dto.branchId ?? null;
    let deliveryAddress: Order['deliveryAddress'] | null = null;

    for (const inputLine of dto.items) {
      const item = await this.itemsRepository.findOne({
        where: { id: inputLine.itemId },
      });

      if (!item) {
        throw new NotFoundException('Menu item not found');
      }

      const quantity = inputLine.quantity;
      const basePrice = Number(item.basePrice);
      const lineTotal = basePrice * quantity;

      total += lineTotal;
      lines.push({
        itemId: item.id,
        name: item.name,
        basePrice,
        quantity,
      });
    }

    if (dto.addressId) {
      const address = await this.addressesRepository.findOne({
        where: { id: dto.addressId, user: { id: userId } },
      });

      if (!address) {
        throw new NotFoundException('Address not found');
      }

      deliveryAddress = {
        addressId: address.id,
        label: address.label,
        line1: address.line1,
        line2: address.line2 ?? null,
        city: address.city,
        postalCode: address.postalCode ?? null,
        country: address.country,
      };
    }

    const order = this.ordersRepository.create({
      user: { id: userId } as any,
      items: lines,
      totalAmount: total,
      status: 'created',
      paymentStatus: 'unpaid',
      branchId,
      deliveryAddress,
    });

    return this.ordersRepository.save(order);
  }

  async findForUser(userId: string): Promise<Order[]> {
    return this.ordersRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }

  async findForRider(riderId: string): Promise<Order[]> {
    return this.ordersRepository.find({
      where: { rider: { id: riderId } },
      order: { createdAt: 'DESC' },
    });
  }

  private async getBranchWithOwner(branchId: string): Promise<Branch> {
    const branch = await this.branchesRepository.findOne({
      where: { id: branchId },
      relations: ['vendor', 'vendor.owner'],
    });

    if (!branch) {
      throw new NotFoundException('Branch not found');
    }

    return branch;
  }

  async findAll(): Promise<Order[]> {
    return this.ordersRepository.find({
      order: { createdAt: 'DESC' },
      relations: ['rider'],
    });
  }

  private assertCanManageBranch(branch: Branch, user: CurrentUserPayload): void {
    if (user.role === UserRole.ADMIN) {
      return;
    }

    if (
      user.role === UserRole.VENDOR_MANAGER &&
      branch.vendor.owner.id === user.userId
    ) {
      return;
    }

    throw new ForbiddenException('You do not have access to this branch');
  }

  async findForBranchManagedBy(
    branchId: string,
    user: CurrentUserPayload,
  ): Promise<Order[]> {
    const branch = await this.getBranchWithOwner(branchId);
    this.assertCanManageBranch(branch, user);

    return this.ordersRepository.find({
      where: { branchId },
      order: { createdAt: 'DESC' },
      relations: ['rider'],
    });
  }

  async getBranchAnalytics(
    branchId: string,
    user: CurrentUserPayload,
    days = 7,
  ): Promise<{
    ordersPerDay: Array<{ date: string; count: number }>;
    revenuePerDay: Array<{ date: string; total: number }>;
    topItems: Array<{ name: string; quantity: number; amount: number }>;
  }> {
    const branch = await this.getBranchWithOwner(branchId);
    this.assertCanManageBranch(branch, user);

    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - (days - 1));

    const ordersPerDay = await this.ordersRepository
      .createQueryBuilder('order')
      .select("to_char(order.createdAt, 'YYYY-MM-DD')", 'date')
      .addSelect('COUNT(*)', 'count')
      .where('order.branchId = :branchId', { branchId })
      .andWhere('order.createdAt >= :start', { start })
      .groupBy("to_char(order.createdAt, 'YYYY-MM-DD')")
      .orderBy("to_char(order.createdAt, 'YYYY-MM-DD')", 'ASC')
      .getRawMany();

    const revenuePerDay = await this.ordersRepository
      .createQueryBuilder('order')
      .select("to_char(order.createdAt, 'YYYY-MM-DD')", 'date')
      .addSelect('SUM(order.totalAmount)', 'total')
      .where('order.branchId = :branchId', { branchId })
      .andWhere('order.createdAt >= :start', { start })
      .groupBy("to_char(order.createdAt, 'YYYY-MM-DD')")
      .orderBy("to_char(order.createdAt, 'YYYY-MM-DD')", 'ASC')
      .getRawMany();

    const topItems = await this.ordersRepository.query(
      `
        SELECT
          item->>'name' AS name,
          SUM((item->>'quantity')::int) AS quantity,
          SUM((item->>'quantity')::int * (item->>'basePrice')::numeric) AS amount
        FROM "order" o
        CROSS JOIN LATERAL jsonb_array_elements(o.items) AS item
        WHERE o."branchId" = $1
          AND o."createdAt" >= $2
        GROUP BY item->>'name'
        ORDER BY quantity DESC
        LIMIT 5
      `,
      [branchId, start],
    );

    return {
      ordersPerDay: ordersPerDay.map((row) => ({
        date: row.date,
        count: Number(row.count),
      })),
      revenuePerDay: revenuePerDay.map((row) => ({
        date: row.date,
        total: Number(row.total),
      })),
      topItems: topItems.map((row: any) => ({
        name: row.name,
        quantity: Number(row.quantity),
        amount: Number(row.amount),
      })),
    };
  }

  async updateStatusForBranchManagedBy(
    orderId: string,
    status: string,
    user: CurrentUserPayload,
  ): Promise<Order> {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
      relations: ['rider', 'user'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (!order.branchId) {
      throw new NotFoundException('Branch not found for order');
    }

    const branch = await this.getBranchWithOwner(order.branchId);
    this.assertCanManageBranch(branch, user);

    const beforeStatus = order.status;
    order.status = status;
    const saved = await this.ordersRepository.save(order);
    await this.auditService.record({
      actorId: user.userId,
      actorRole: user.role,
      action: 'order.status.update',
      entityType: 'order',
      entityId: order.id,
      before: { status: beforeStatus },
      after: { status },
    });
    await this.ordersNotificationsService.notifyStatusChange(saved);
    return saved;
  }

  async assignRiderForBranchManagedBy(
    orderId: string,
    riderUserId: string,
    user: CurrentUserPayload,
  ): Promise<Order> {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (!order.branchId) {
      throw new NotFoundException('Branch not found for order');
    }

    const branch = await this.getBranchWithOwner(order.branchId);
    this.assertCanManageBranch(branch, user);

    const rider = await this.usersService.findById(riderUserId);

    if (!rider) {
      throw new NotFoundException('Rider user not found');
    }

    if (rider.role !== UserRole.RIDER) {
      throw new BadRequestException('User is not a rider');
    }

    const beforeRiderId = order.rider?.id ?? null;
    order.rider = rider;
    const saved = await this.ordersRepository.save(order);
    await this.auditService.record({
      actorId: user.userId,
      actorRole: user.role,
      action: 'order.assignRider',
      entityType: 'order',
      entityId: order.id,
      before: { riderId: beforeRiderId },
      after: { riderId: rider.id },
    });
    return saved;
  }

  async updateStatusForRider(
    orderId: string,
    status: string,
    user: CurrentUserPayload,
  ): Promise<Order> {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
      relations: ['rider', 'user'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (!order.rider || order.rider.id !== user.userId) {
      throw new ForbiddenException('You do not have access to this order');
    }

    const beforeStatus = order.status;
    order.status = status;
    const saved = await this.ordersRepository.save(order);
    await this.auditService.record({
      actorId: user.userId,
      actorRole: user.role,
      action: 'order.riderStatus.update',
      entityType: 'order',
      entityId: order.id,
      before: { status: beforeStatus },
      after: { status },
    });
    await this.ordersNotificationsService.notifyStatusChange(saved);
    return saved;
  }

  async createPaymentIntent(
    orderId: string,
    user: CurrentUserPayload,
  ): Promise<{
    clientSecret: string;
    amount: number;
    currency: string;
    paymentStatus: string;
  }> {
    return this.paymentsService.createPaymentIntent(orderId, user);
  }

  async confirmPaymentIntent(
    orderId: string,
    user: CurrentUserPayload,
  ): Promise<{
    status: 'succeeded';
    paymentStatus: string;
  }> {
    return this.paymentsService.confirmPaymentIntent(orderId, user);
  }
}
