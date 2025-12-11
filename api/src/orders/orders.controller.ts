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
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateOrderDto } from './dto/create-order.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/user-role.enum';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { AssignRiderDto } from './dto/assign-rider.dto';

@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@CurrentUser() user: any, @Body() dto: CreateOrderDto) {
    return this.ordersService.createForUser(user.userId, dto);
  }

  @Get()
  findForCurrentUser(@CurrentUser() user: any) {
    return this.ordersService.findForUser(user.userId);
  }

  @Get('rider')
  @Roles(UserRole.RIDER)
  findForCurrentRider(@CurrentUser() user: any) {
    return this.ordersService.findForRider(user.userId);
  }

  @Get('admin')
  @Roles(UserRole.ADMIN)
  findAllForAdmin() {
    return this.ordersService.findAll();
  }

  @Get('branch/:branchId')
  @Roles(UserRole.ADMIN, UserRole.VENDOR_MANAGER)
  findForBranch(
    @Param('branchId', ParseUUIDPipe) branchId: string,
    @CurrentUser() user: any,
  ) {
    return this.ordersService.findForBranchManagedBy(branchId, {
      userId: user.userId,
      role: user.role,
    });
  }

  @Patch(':orderId/status')
  @Roles(UserRole.ADMIN, UserRole.VENDOR_MANAGER)
  updateStatus(
    @Param('orderId', ParseUUIDPipe) orderId: string,
    @Body() dto: UpdateOrderStatusDto,
    @CurrentUser() user: any,
  ) {
    return this.ordersService.updateStatusForBranchManagedBy(orderId, dto.status, {
      userId: user.userId,
      role: user.role,
    });
  }

  @Patch(':orderId/assign-rider')
  @Roles(UserRole.ADMIN, UserRole.VENDOR_MANAGER)
  assignRider(
    @Param('orderId', ParseUUIDPipe) orderId: string,
    @Body() dto: AssignRiderDto,
    @CurrentUser() user: any,
  ) {
    return this.ordersService.assignRiderForBranchManagedBy(orderId, dto.riderUserId, {
      userId: user.userId,
      role: user.role,
    });
  }

  @Patch(':orderId/rider-status')
  @Roles(UserRole.RIDER)
  updateStatusForRider(
    @Param('orderId', ParseUUIDPipe) orderId: string,
    @Body() dto: UpdateOrderStatusDto,
    @CurrentUser() user: any,
  ) {
    return this.ordersService.updateStatusForRider(orderId, dto.status, {
      userId: user.userId,
      role: user.role,
    });
  }
}
