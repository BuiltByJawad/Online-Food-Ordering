import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
<<<<<<< HEAD
import { MenuItem } from './menu-item.entity';
import { MenuService } from './menu.service';
import { MenuController } from './menu.controller';

@Module({
  imports: [TypeOrmModule.forFeature([MenuItem])],
  providers: [MenuService],
  controllers: [MenuController],
=======
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
>>>>>>> fd897c04ea83262b56abf608b5aae4be4db3f547
  exports: [MenuService],
})
export class MenuModule {}
