import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MenuCategory } from './menu-category.entity';
import { MenuItem } from './menu-item.entity';
import { MenuOption } from './menu-option.entity';
import { Branch } from '../vendors/branch.entity';
import { CreateMenuCategoryDto } from './dto/create-menu-category.dto';
import { UpdateMenuCategoryDto } from './dto/update-menu-category.dto';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { CreateMenuOptionDto } from './dto/create-menu-option.dto';
import { UpdateMenuOptionDto } from './dto/update-menu-option.dto';
import { UserRole } from '../users/user-role.enum';

interface CurrentUserPayload {
  userId: string;
  role: UserRole;
}

@Injectable()
export class MenuService {
  constructor(
    @InjectRepository(MenuCategory)
    private readonly categoriesRepository: Repository<MenuCategory>,
    @InjectRepository(MenuItem)
    private readonly itemsRepository: Repository<MenuItem>,
    @InjectRepository(MenuOption)
    private readonly optionsRepository: Repository<MenuOption>,
    @InjectRepository(Branch)
    private readonly branchesRepository: Repository<Branch>,
  ) {}

  async getBranchMenu(branchId: string): Promise<MenuCategory[]> {
    const branch = await this.branchesRepository.findOne({ where: { id: branchId } });

    if (!branch) {
      throw new NotFoundException('Branch not found');
    }

    return this.categoriesRepository.find({
      where: { branch: { id: branchId } },
      relations: ['items', 'items.options'],
      order: { sortOrder: 'ASC', createdAt: 'ASC' },
    });
  }

  async getBranchPublicInfo(branchId: string): Promise<{
    id: string;
    name: string;
    city: string;
    country: string;
    vendorName: string | null;
  }> {
    const branch = await this.branchesRepository.findOne({
      where: { id: branchId },
      relations: ['vendor'],
    });

    if (!branch) {
      throw new NotFoundException('Branch not found');
    }

    const vendorName = branch.vendor?.brandName ?? branch.vendor?.name ?? null;

    return {
      id: branch.id,
      name: branch.name,
      city: branch.city,
      country: branch.country,
      vendorName,
    };
  }

  private async getBranchWithOwner(branchId: string): Promise<Branch> {
    const branch = await this.branchesRepository.findOne({
      where: { id: branchId },
      relations: ['vendor', 'vendor.owner'],
    });

    if (!branch) {
      throw new NotFoundException('Branch not found');
    }

    return branch;
  }

  private assertCanManageBranch(branch: Branch, user: CurrentUserPayload): void {
    if (user.role === UserRole.ADMIN) {
      return;
    }

    if (
      user.role === UserRole.VENDOR_MANAGER &&
      branch.vendor.owner.id === user.userId
    ) {
      return;
    }

    throw new ForbiddenException('You do not have access to this branch');
  }

  async createCategoryForBranch(
    branchId: string,
    dto: CreateMenuCategoryDto,
    user: CurrentUserPayload,
  ): Promise<MenuCategory> {
    const branch = await this.getBranchWithOwner(branchId);
    this.assertCanManageBranch(branch, user);

    const category = this.categoriesRepository.create({
      branch,
      name: dto.name,
      sortOrder: dto.sortOrder ?? 0,
    });

    return this.categoriesRepository.save(category);
  }

  async getCategoriesForBranch(branchId: string): Promise<MenuCategory[]> {
    return this.categoriesRepository.find({
      where: { branch: { id: branchId } },
      relations: ['items', 'items.options'],
      order: { sortOrder: 'ASC', createdAt: 'ASC' },
    });
  }

  private async getCategoryWithBranchOwner(
    categoryId: string,
  ): Promise<MenuCategory> {
    const category = await this.categoriesRepository.findOne({
      where: { id: categoryId },
      relations: ['branch', 'branch.vendor', 'branch.vendor.owner'],
    });

    if (!category) {
      throw new NotFoundException('Menu category not found');
    }

    return category;
  }

  async updateCategory(
    categoryId: string,
    dto: UpdateMenuCategoryDto,
    user: CurrentUserPayload,
  ): Promise<MenuCategory> {
    const category = await this.getCategoryWithBranchOwner(categoryId);
    this.assertCanManageBranch(category.branch, user);

    Object.assign(category, dto);
    return this.categoriesRepository.save(category);
  }

  async deleteCategory(categoryId: string, user: CurrentUserPayload): Promise<void> {
    const category = await this.getCategoryWithBranchOwner(categoryId);
    this.assertCanManageBranch(category.branch, user);

    await this.categoriesRepository.delete(category.id);
  }

  private async getCategoryForItemCreation(
    categoryId: string,
    user: CurrentUserPayload,
  ): Promise<MenuCategory> {
    const category = await this.getCategoryWithBranchOwner(categoryId);
    this.assertCanManageBranch(category.branch, user);
    return category;
  }

  async createItemForCategory(
    categoryId: string,
    dto: CreateMenuItemDto,
    user: CurrentUserPayload,
  ): Promise<MenuItem> {
    const category = await this.getCategoryForItemCreation(categoryId, user);

    const item = this.itemsRepository.create({
      category,
      name: dto.name,
      description: dto.description,
      imageUrl: dto.imageUrl,
      basePrice: dto.basePrice,
      taxCategory: dto.taxCategory,
      isAvailable: dto.isAvailable ?? true,
      availabilitySchedule: dto.availabilitySchedule,
    });

    return this.itemsRepository.save(item);
  }

  private async getItemWithBranchOwner(itemId: string): Promise<MenuItem> {
    const item = await this.itemsRepository.findOne({
      where: { id: itemId },
      relations: [
        'category',
        'category.branch',
        'category.branch.vendor',
        'category.branch.vendor.owner',
      ],
    });

    if (!item) {
      throw new NotFoundException('Menu item not found');
    }

    return item;
  }

  async updateItem(
    itemId: string,
    dto: UpdateMenuItemDto,
    user: CurrentUserPayload,
  ): Promise<MenuItem> {
    const item = await this.getItemWithBranchOwner(itemId);
    this.assertCanManageBranch(item.category.branch, user);

    Object.assign(item, dto);
    return this.itemsRepository.save(item);
  }

  async deleteItem(itemId: string, user: CurrentUserPayload): Promise<void> {
    const item = await this.getItemWithBranchOwner(itemId);
    this.assertCanManageBranch(item.category.branch, user);

    await this.itemsRepository.delete(item.id);
  }

  private async getItemForOptionCreation(
    itemId: string,
    user: CurrentUserPayload,
  ): Promise<MenuItem> {
    const item = await this.getItemWithBranchOwner(itemId);
    this.assertCanManageBranch(item.category.branch, user);
    return item;
  }

  private async getOptionWithBranchOwner(
    optionId: string,
  ): Promise<MenuOption> {
    const option = await this.optionsRepository.findOne({
      where: { id: optionId },
      relations: [
        'item',
        'item.category',
        'item.category.branch',
        'item.category.branch.vendor',
        'item.category.branch.vendor.owner',
      ],
    });

    if (!option) {
      throw new NotFoundException('Menu option not found');
    }

    return option;
  }

  async createOptionForItem(
    itemId: string,
    dto: CreateMenuOptionDto,
    user: CurrentUserPayload,
  ): Promise<MenuOption> {
    const item = await this.getItemForOptionCreation(itemId, user);

    const option = this.optionsRepository.create({
      item,
      type: dto.type,
      name: dto.name,
      priceDelta: dto.priceDelta ?? 0,
      isRequired: dto.isRequired ?? false,
      maxSelection: dto.maxSelection,
    });

    return this.optionsRepository.save(option);
  }

  async updateOption(
    optionId: string,
    dto: UpdateMenuOptionDto,
    user: CurrentUserPayload,
  ): Promise<MenuOption> {
    const option = await this.getOptionWithBranchOwner(optionId);
    this.assertCanManageBranch(option.item.category.branch, user);

    Object.assign(option, dto);
    return this.optionsRepository.save(option);
  }

  async deleteOption(optionId: string, user: CurrentUserPayload): Promise<void> {
    const option = await this.getOptionWithBranchOwner(optionId);
    this.assertCanManageBranch(option.item.category.branch, user);

    await this.optionsRepository.delete(option.id);
  }
}
