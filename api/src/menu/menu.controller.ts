import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { MenuService } from './menu.service';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { ParseUUIDPipe } from '@nestjs/common';

@Controller('menu-items')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Get()
  list(@Query('branchId') branchId?: string) {
    if (branchId) {
      // validate UUID if provided
      new ParseUUIDPipe().transform(branchId, { type: 'query', data: 'branchId' });
    }
    return this.menuService.findAll(branchId);
  }

  @Post()
  create(@Body() dto: CreateMenuItemDto) {
    return this.menuService.create(dto);
  }
}
