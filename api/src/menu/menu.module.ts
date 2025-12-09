import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenuCategory } from './menu-category.entity';
import { MenuItem } from './menu-item.entity';
import { MenuOption } from './menu-option.entity';
import { MenuService } from './menu.service';
import { MenuController } from './menu.controller';
import { Branch } from '../vendors/branch.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MenuCategory, MenuItem, MenuOption, Branch])],
  controllers: [MenuController],
  providers: [MenuService],
  exports: [MenuService],
})
export class MenuModule {}
