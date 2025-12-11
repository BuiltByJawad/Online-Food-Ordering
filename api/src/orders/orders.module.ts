import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { Order } from './order.entity';
import { MenuItem } from '../menu/menu-item.entity';
import { Address } from '../addresses/address.entity';
import { Branch } from '../vendors/branch.entity';
import { UsersModule } from '../users/users.module';
import { OrdersNotificationsService } from './orders-notifications.service';
import { PaymentsModule } from '../payments/payments.module';

@Module({
  imports: [TypeOrmModule.forFeature([Order, MenuItem, Address, Branch]), UsersModule, PaymentsModule],
  controllers: [OrdersController],
  providers: [OrdersService, OrdersNotificationsService],
})
export class OrdersModule {}
