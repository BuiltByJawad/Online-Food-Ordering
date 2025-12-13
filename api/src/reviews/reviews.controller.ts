import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/user-role.enum';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER, UserRole.ADMIN)
  create(@Body() dto: CreateReviewDto, @CurrentUser() user: any) {
    return this.reviewsService.create(dto, {
      userId: user.userId,
      role: user.role,
    });
  }

  @Get('order/:orderId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER, UserRole.ADMIN)
  getForOrder(@Param('orderId', ParseUUIDPipe) orderId: string, @CurrentUser() user: any) {
    return this.reviewsService.getForOrder(orderId, {
      userId: user.userId,
      role: user.role,
    });
  }

  @Get('branch/:branchId')
  getForBranch(@Param('branchId', ParseUUIDPipe) branchId: string) {
    return this.reviewsService.listForBranch(branchId);
  }

  @Get('branch/:branchId/summary')
  getBranchSummary(@Param('branchId', ParseUUIDPipe) branchId: string) {
    return this.reviewsService.getBranchSummary(branchId);
  }

  @Patch(':reviewId/moderate/:approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPPORT)
  moderate(
    @Param('reviewId', ParseUUIDPipe) reviewId: string,
    @Param('approve') approve: string,
    @CurrentUser() user: any,
  ) {
    const flag = approve === 'true' || approve === '1' || approve === 'yes';
    return this.reviewsService.moderate(reviewId, flag, {
      userId: user.userId,
      role: user.role,
    });
  }
}
