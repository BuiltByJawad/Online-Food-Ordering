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

  async updateStatusForBranchManagedBy(
    orderId: string,
    status: string,
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

    order.status = status;
    return this.ordersRepository.save(order);
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

    order.rider = rider;
    return this.ordersRepository.save(order);
  }

  async updateStatusForRider(
    orderId: string,
    status: string,
    user: CurrentUserPayload,
  ): Promise<Order> {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
      relations: ['rider'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (!order.rider || order.rider.id !== user.userId) {
      throw new ForbiddenException('You do not have access to this order');
    }

    order.status = status;
    return this.ordersRepository.save(order);
  }
}
