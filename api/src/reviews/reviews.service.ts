import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './review.entity';
import { Order } from '../orders/order.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { AuditService } from '../audit/audit.service';
import { UserRole } from '../users/user-role.enum';

interface CurrentUserPayload {
  userId: string;
  role: UserRole;
}

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewsRepository: Repository<Review>,
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    private readonly auditService: AuditService,
  ) {}

  private assertCanReview(order: Order, user: CurrentUserPayload) {
    if (user.role === UserRole.ADMIN) return;
    if (order.user?.id === user.userId) return;
    throw new ForbiddenException('You do not have access to review this order');
  }

  async create(dto: CreateReviewDto, user: CurrentUserPayload): Promise<Review> {
    const order = await this.ordersRepository.findOne({
      where: { id: dto.orderId },
      relations: ['user'],
    });

    if (!order) throw new NotFoundException('Order not found');
    if (order.status !== 'completed') {
      throw new ForbiddenException('Only completed orders can be reviewed');
    }

    this.assertCanReview(order, user);

    const existing = await this.reviewsRepository.findOne({
      where: { order: { id: dto.orderId } },
    });
    if (existing) {
      throw new ForbiddenException('Order already reviewed');
    }

    const review = this.reviewsRepository.create({
      order,
      customer: { id: user.userId } as any,
      branchId: order.branchId,
      rating: dto.rating,
      comment: dto.comment ?? null,
      isApproved: true,
    });

    const saved = await this.reviewsRepository.save(review);

    await this.auditService.record({
      actorId: user.userId,
      actorRole: user.role,
      action: 'review.create',
      entityType: 'review',
      entityId: saved.id,
      after: {
        rating: saved.rating,
        comment: saved.comment,
        orderId: order.id,
      },
    });

    return saved;
  }

  async listForBranch(branchId: string): Promise<Review[]> {
    return this.reviewsRepository.find({
      where: { branchId, isApproved: true },
      order: { createdAt: 'DESC' },
    });
  }

  async listForVendor(branchIds: string[]): Promise<Review[]> {
    return this.reviewsRepository
      .createQueryBuilder('review')
      .where('review.branchId IN (:...branchIds)', { branchIds })
      .andWhere('review.isApproved = :approved', { approved: true })
      .orderBy('review.createdAt', 'DESC')
      .getMany();
  }

  async getBranchSummary(branchId: string): Promise<{ average: number; count: number }> {
    const result = await this.reviewsRepository
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'avg')
      .addSelect('COUNT(*)', 'count')
      .where('review.branchId = :branchId', { branchId })
      .andWhere('review.isApproved = :approved', { approved: true })
      .getRawOne<{ avg: string | null; count: string }>();

    const average = result?.avg ? parseFloat(result.avg) : 0;
    const total = result?.count ? parseInt(result.count, 10) : 0;
    return { average, count: total };
  }

  async getForOrder(orderId: string, user: CurrentUserPayload): Promise<Review | null> {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
      relations: ['user'],
    });
    if (!order) throw new NotFoundException('Order not found');
    this.assertCanReview(order, user);

    const review = await this.reviewsRepository.findOne({
      where: { order: { id: orderId } },
    });
    return review ?? null;
  }

  async moderate(reviewId: string, approve: boolean, user: CurrentUserPayload): Promise<Review> {
    if (user.role !== UserRole.ADMIN && user.role !== UserRole.SUPPORT) {
      throw new ForbiddenException('Not allowed');
    }
    const review = await this.reviewsRepository.findOne({ where: { id: reviewId } });
    if (!review) throw new NotFoundException('Review not found');
    const before = { isApproved: review.isApproved };
    review.isApproved = approve;
    const saved = await this.reviewsRepository.save(review);
    await this.auditService.record({
      actorId: user.userId,
      actorRole: user.role,
      action: 'review.moderate',
      entityType: 'review',
      entityId: review.id,
      before,
      after: { isApproved: review.isApproved },
    });
    return saved;
  }
}
