import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  add(@CurrentUser() user: any, @Body() dto: AddCartItemDto) {
    return this.cartService.add(user.userId, dto);
  }

  @Get()
  list(@CurrentUser() user: any) {
    return this.cartService.list(user.userId);
  }

  @Delete(':id')
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.cartService.remove(user.userId, id);
  }

  @Delete()
  clear(@CurrentUser() user: any) {
    return this.cartService.clear(user.userId);
  }
}
