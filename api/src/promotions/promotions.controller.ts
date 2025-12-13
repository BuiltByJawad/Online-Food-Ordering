import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { PromotionsService } from './promotions.service';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { ApplyPromoDto } from './dto/apply-promo.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/user-role.enum';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('promotions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PromotionsController {
  constructor(private readonly promotionsService: PromotionsService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() dto: CreatePromotionDto, @CurrentUser() user: any) {
    return this.promotionsService.create(dto, user.userId);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.promotionsService.findAll();
  }

  @Post('preview')
  @Throttle({ default: { limit: 10, ttl: 60 } })
  preview(@Body() dto: ApplyPromoDto, @CurrentUser() user: any) {
    return this.promotionsService.preview({
      ...dto,
      userId: user?.userId,
    });
  }
}
