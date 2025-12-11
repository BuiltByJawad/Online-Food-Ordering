import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { MenuService } from './menu.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/user-role.enum';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateMenuCategoryDto } from './dto/create-menu-category.dto';
import { UpdateMenuCategoryDto } from './dto/update-menu-category.dto';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { CreateMenuOptionDto } from './dto/create-menu-option.dto';
import { UpdateMenuOptionDto } from './dto/update-menu-option.dto';

@Controller()
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Get('branches/:branchId/menu')
  getBranchMenu(@Param('branchId', ParseUUIDPipe) branchId: string) {
    return this.menuService.getBranchMenu(branchId);
  }

  @Get('branches/:branchId/info')
  getBranchInfo(@Param('branchId', ParseUUIDPipe) branchId: string) {
    return this.menuService.getBranchPublicInfo(branchId);
  }

  @Post('branches/:branchId/menu-categories')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VENDOR_MANAGER)
  createCategory(
    @Param('branchId', ParseUUIDPipe) branchId: string,
    @Body() dto: CreateMenuCategoryDto,
    @CurrentUser() user: any,
  ) {
    return this.menuService.createCategoryForBranch(branchId, dto, user);
  }

  @Get('branches/:branchId/menu-categories')
  getCategories(@Param('branchId', ParseUUIDPipe) branchId: string) {
    return this.menuService.getCategoriesForBranch(branchId);
  }

  @Patch('menu-categories/:categoryId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VENDOR_MANAGER)
  updateCategory(
    @Param('categoryId', ParseUUIDPipe) categoryId: string,
    @Body() dto: UpdateMenuCategoryDto,
    @CurrentUser() user: any,
  ) {
    return this.menuService.updateCategory(categoryId, dto, user);
  }

  @Delete('menu-categories/:categoryId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VENDOR_MANAGER)
  deleteCategory(
    @Param('categoryId', ParseUUIDPipe) categoryId: string,
    @CurrentUser() user: any,
  ) {
    return this.menuService.deleteCategory(categoryId, user);
  }

  @Post('menu-categories/:categoryId/items')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VENDOR_MANAGER)
  createItem(
    @Param('categoryId', ParseUUIDPipe) categoryId: string,
    @Body() dto: CreateMenuItemDto,
    @CurrentUser() user: any,
  ) {
    return this.menuService.createItemForCategory(categoryId, dto, user);
  }

  @Patch('menu-items/:itemId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VENDOR_MANAGER)
  updateItem(
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Body() dto: UpdateMenuItemDto,
    @CurrentUser() user: any,
  ) {
    return this.menuService.updateItem(itemId, dto, user);
  }

  @Delete('menu-items/:itemId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VENDOR_MANAGER)
  deleteItem(
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @CurrentUser() user: any,
  ) {
    return this.menuService.deleteItem(itemId, user);
  }

  @Post('menu-items/:itemId/options')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VENDOR_MANAGER)
  createOption(
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Body() dto: CreateMenuOptionDto,
    @CurrentUser() user: any,
  ) {
    return this.menuService.createOptionForItem(itemId, dto, user);
  }

  @Patch('menu-options/:optionId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VENDOR_MANAGER)
  updateOption(
    @Param('optionId', ParseUUIDPipe) optionId: string,
    @Body() dto: UpdateMenuOptionDto,
    @CurrentUser() user: any,
  ) {
    return this.menuService.updateOption(optionId, dto, user);
  }

  @Delete('menu-options/:optionId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VENDOR_MANAGER)
  deleteOption(
    @Param('optionId', ParseUUIDPipe) optionId: string,
    @CurrentUser() user: any,
  ) {
    return this.menuService.deleteOption(optionId, user);
  }
}
