import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { Order } from './order.entity';
import { MenuItem } from '../menu/menu-item.entity';
import { Address } from '../addresses/address.entity';
import { Branch } from '../vendors/branch.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, MenuItem, Address, Branch])],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
