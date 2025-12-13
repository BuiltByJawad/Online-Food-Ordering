import { Controller, Post, Param, ParseUUIDPipe, UseGuards, Headers } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/user-role.enum';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Throttle } from '@nestjs/throttler';

@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post(':orderId/intent')
  @Throttle({ default: { limit: 5, ttl: 60 } })
  @Roles(UserRole.ADMIN, UserRole.CUSTOMER)
  createIntent(
    @Param('orderId', ParseUUIDPipe) orderId: string,
    @CurrentUser() user: any,
    @Headers('idempotency-key') idempotencyKey?: string,
  ) {
    return this.paymentsService.createPaymentIntent(
      orderId,
      {
        userId: user.userId,
        role: user.role,
      },
      idempotencyKey ?? undefined,
    );
  }

  @Post(':orderId/confirm')
  @Throttle({ default: { limit: 5, ttl: 60 } })
  @Roles(UserRole.ADMIN, UserRole.CUSTOMER)
  confirmIntent(
    @Param('orderId', ParseUUIDPipe) orderId: string,
    @CurrentUser() user: any,
    @Headers('idempotency-key') idempotencyKey?: string,
  ) {
    return this.paymentsService.confirmPaymentIntent(
      orderId,
      {
        userId: user.userId,
        role: user.role,
      },
      idempotencyKey ?? undefined,
    );
  }
}
