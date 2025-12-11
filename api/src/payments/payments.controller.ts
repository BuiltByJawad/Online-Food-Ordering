import { Controller, Post, Param, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/user-role.enum';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post(':orderId/intent')
  @Roles(UserRole.ADMIN, UserRole.CUSTOMER)
  createIntent(
    @Param('orderId', ParseUUIDPipe) orderId: string,
    @CurrentUser() user: any,
  ) {
    return this.paymentsService.createPaymentIntent(orderId, {
      userId: user.userId,
      role: user.role,
    });
  }

  @Post(':orderId/confirm')
  @Roles(UserRole.ADMIN, UserRole.CUSTOMER)
  confirmIntent(
    @Param('orderId', ParseUUIDPipe) orderId: string,
    @CurrentUser() user: any,
  ) {
    return this.paymentsService.confirmPaymentIntent(orderId, {
      userId: user.userId,
      role: user.role,
    });
  }
}
