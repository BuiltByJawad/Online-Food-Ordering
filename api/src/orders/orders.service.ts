import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './order.entity';
import { MenuItem } from '../menu/menu-item.entity';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    @InjectRepository(MenuItem)
    private readonly itemsRepository: Repository<MenuItem>,
  ) {}

  async createForUser(userId: string, dto: CreateOrderDto): Promise<Order> {
    const lines: Order['items'] = [];
    let total = 0;
    const branchId = dto.branchId ?? null;

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

    const order = this.ordersRepository.create({
      user: { id: userId } as any,
      items: lines,
      totalAmount: total,
      status: 'created',
      branchId,
    });

    return this.ordersRepository.save(order);
  }

  async findForUser(userId: string): Promise<Order[]> {
    return this.ordersRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }
}
