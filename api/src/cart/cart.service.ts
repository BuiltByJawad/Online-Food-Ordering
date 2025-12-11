import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartItem } from './cart-item.entity';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { MenuService } from '../menu/menu.service';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartItem)
    private readonly cartRepository: Repository<CartItem>,
    private readonly menuService: MenuService,
  ) {}

  async add(userId: string, dto: AddCartItemDto) {
    const item = await this.menuService.findOne(dto.menuItemId);
    if (!item || !item.isAvailable) {
      throw new NotFoundException('Menu item not available');
    }

    const existing = await this.cartRepository.findOne({
      where: { userId, menuItemId: dto.menuItemId },
    });

    const unitPrice = Number(item.basePrice);
    const branchId =
      dto.branchId ??
      (item.category && item.category.branch ? item.category.branch.id : null) ??
      null;

    if (existing) {
      existing.quantity += dto.quantity;
      existing.unitPrice = unitPrice;
      existing.branchId = branchId;
      return this.cartRepository.save(existing);
    }

    const created = this.cartRepository.create({
      userId,
      branchId,
      menuItemId: dto.menuItemId,
      quantity: dto.quantity,
      unitPrice,
    });
    return this.cartRepository.save(created);
  }

  async list(userId: string) {
    return this.cartRepository.find({ where: { userId }, order: { createdAt: 'DESC' } });
  }

  async remove(userId: string, cartItemId: string) {
    const found = await this.cartRepository.findOne({ where: { id: cartItemId, userId } });
    if (!found) {
      throw new NotFoundException('Cart item not found');
    }
    await this.cartRepository.delete(found.id);
    return { success: true };
  }

  async clear(userId: string) {
    await this.cartRepository.delete({ userId });
    return { success: true };
  }
}
