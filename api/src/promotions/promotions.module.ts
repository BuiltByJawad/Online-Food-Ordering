import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Promotion } from './promotion.entity';
import { PromotionsService } from './promotions.service';
import { PromotionsController } from './promotions.controller';
import { AuditModule } from '../audit/audit.module';
import { Order } from '../orders/order.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Promotion, Order]), AuditModule],
  controllers: [PromotionsController],
  providers: [PromotionsService],
  exports: [PromotionsService],
})
export class PromotionsModule {}
