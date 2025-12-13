import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Promotion } from './promotion.entity';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { ApplyPromoDto } from './dto/apply-promo.dto';
import { AuditService } from '../audit/audit.service';
import { Order } from '../orders/order.entity';

@Injectable()
export class PromotionsService {
  constructor(
    @InjectRepository(Promotion)
    private readonly promotionsRepository: Repository<Promotion>,
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    private readonly auditService: AuditService,
  ) {}

  async create(dto: CreatePromotionDto, actorId: string): Promise<Promotion> {
    const code = dto.code.toUpperCase();
    const existing = await this.promotionsRepository.findOne({
      where: { code },
    });
    if (existing) {
      throw new BadRequestException('Promotion code already exists');
    }

    const promo = this.promotionsRepository.create({
      ...dto,
      code,
      status: dto.status ?? 'active',
      maxUses: dto.maxUses ?? 0,
      perUserLimit: dto.perUserLimit ?? 0,
    });
    const saved = await this.promotionsRepository.save(promo);
    await this.auditService.record({
      actorId,
      actorRole: 'admin',
      action: 'promotion.create',
      entityType: 'promotion',
      entityId: saved.id,
      after: saved,
    });
    return saved;
  }

  async findAll(): Promise<Promotion[]> {
    return this.promotionsRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  private calculateDiscount(
    promo: Promotion,
    orderSubtotal: number,
  ): { discount: number; totalAfter: number } {
    if (orderSubtotal <= 0) {
      return { discount: 0, totalAfter: 0 };
    }
    let discount =
      promo.discountType === 'percent'
        ? (orderSubtotal * Number(promo.discountValue)) / 100
        : Number(promo.discountValue);
    if (promo.maxDiscount != null) {
      discount = Math.min(discount, Number(promo.maxDiscount));
    }
    discount = Math.min(discount, orderSubtotal);
    const totalAfter = Number((orderSubtotal - discount).toFixed(2));
    return { discount: Number(discount.toFixed(2)), totalAfter };
  }

  private assertPromoUsable(
    promo: Promotion,
    now: Date,
    branchId?: string,
  ): void {
    if (promo.status !== 'active') {
      throw new BadRequestException('Promotion is inactive');
    }
    if (promo.validFrom && promo.validFrom > now) {
      throw new BadRequestException('Promotion not yet valid');
    }
    if (promo.validTo && promo.validTo < now) {
      throw new BadRequestException('Promotion expired');
    }
    if (promo.branchId) {
      if (!branchId || promo.branchId !== branchId) {
        throw new BadRequestException('Promotion not valid for this branch');
      }
    }
    if (promo.maxUses > 0 && promo.usageCount >= promo.maxUses) {
      throw new BadRequestException('Promotion has reached max uses');
    }
  }

  async preview(
    dto: ApplyPromoDto,
  ): Promise<{ discount: number; total: number; code: string }> {
    const code = dto.code.toUpperCase();
    const promo = await this.promotionsRepository.findOne({ where: { code } });
    if (!promo) {
      throw new NotFoundException('Promotion not found');
    }
    const now = new Date();
    this.assertPromoUsable(promo, now, dto.branchId);

    if (promo.perUserLimit && promo.perUserLimit > 0 && dto.userId) {
      const usedCount = await this.ordersRepository.count({
        where: { user: { id: dto.userId }, promoCode: code },
      });
      if (usedCount >= promo.perUserLimit) {
        throw new BadRequestException('Promotion usage limit reached for user');
      }
    }

    const { discount, totalAfter } = this.calculateDiscount(
      promo,
      dto.orderSubtotal,
    );

    return { discount, total: totalAfter, code };
  }

  async applyAndConsume(
    dto: ApplyPromoDto,
  ): Promise<{ discount: number; total: number; code: string }> {
    const result = await this.preview(dto);
    await this.consume(result.code);
    return result;
  }

  async consume(code: string): Promise<void> {
    const promo = await this.promotionsRepository.findOne({ where: { code } });
    if (!promo) {
      throw new NotFoundException('Promotion not found');
    }
    promo.usageCount += 1;
    await this.promotionsRepository.save(promo);
  }
}
