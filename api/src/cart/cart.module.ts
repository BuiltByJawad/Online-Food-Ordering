import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartItem } from './cart-item.entity';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { MenuModule } from '../menu/menu.module';

@Module({
  imports: [TypeOrmModule.forFeature([CartItem]), MenuModule],
  providers: [CartService],
  controllers: [CartController],
  exports: [CartService],
})
export class CartModule {}
