import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { MenuService } from './menu.service';
import { MenuCategory } from './menu-category.entity';
import { MenuItem } from './menu-item.entity';
import { MenuOption } from './menu-option.entity';
import { Branch } from '../vendors/branch.entity';
import { UserRole } from '../users/user-role.enum';

const createMockRepository = <T>() => ({
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
}) as unknown as jest.Mocked<Repository<T>>;

const adminUser = { userId: 'admin-id', role: UserRole.ADMIN } as const;
const vendorUser = { userId: 'vendor-owner-id', role: UserRole.VENDOR_MANAGER } as const;
const strangerUser = { userId: 'stranger-id', role: UserRole.VENDOR_MANAGER } as const;

describe('MenuService', () => {
  let service: MenuService;
  let categoriesRepository: jest.Mocked<Repository<MenuCategory>>;
  let itemsRepository: jest.Mocked<Repository<MenuItem>>;
  let optionsRepository: jest.Mocked<Repository<MenuOption>>;
  let branchesRepository: jest.Mocked<Repository<Branch>>;

  beforeEach(async () => {
    categoriesRepository = createMockRepository<MenuCategory>();
    itemsRepository = createMockRepository<MenuItem>();
    optionsRepository = createMockRepository<MenuOption>();
    branchesRepository = createMockRepository<Branch>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MenuService,
        {
          provide: getRepositoryToken(MenuCategory),
          useValue: categoriesRepository,
        },
        {
          provide: getRepositoryToken(MenuItem),
          useValue: itemsRepository,
        },
        {
          provide: getRepositoryToken(MenuOption),
          useValue: optionsRepository,
        },
        {
          provide: getRepositoryToken(Branch),
          useValue: branchesRepository,
        },
      ],
    }).compile();

    service = module.get<MenuService>(MenuService);
  });

  describe('getBranchMenu', () => {
    it('throws NotFoundException when branch does not exist', async () => {
      branchesRepository.findOne.mockResolvedValue(null as any);

      await expect(service.getBranchMenu('missing')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('returns categories when branch exists', async () => {
      const branch = { id: 'branch-1' } as Branch;
      const categories: MenuCategory[] = [{ id: 'cat-1' } as MenuCategory];

      branchesRepository.findOne.mockResolvedValue(branch as any);
      categoriesRepository.find.mockResolvedValue(categories as any);

      await expect(service.getBranchMenu(branch.id)).resolves.toBe(categories);
      expect(categoriesRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { branch: { id: branch.id } },
        }),
      );
    });
  });

  describe('createCategoryForBranch', () => {
    const makeBranchWithOwner = (): Branch =>
      ({
        id: 'branch-1',
        vendor: {
          owner: { id: vendorUser.userId },
        },
      } as any);

    it('allows ADMIN to create category for any branch', async () => {
      const branch = makeBranchWithOwner();
      const dto = { name: 'Category', sortOrder: 1 } as any;
      const entity = { id: 'cat-1' } as MenuCategory;

      branchesRepository.findOne.mockResolvedValue(branch as any);
      categoriesRepository.create.mockReturnValue(entity);
      categoriesRepository.save.mockResolvedValue(entity);

      const result = await service.createCategoryForBranch(branch.id, dto, adminUser);

      expect(categoriesRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ branch, name: dto.name, sortOrder: dto.sortOrder }),
      );
      expect(result).toBe(entity);
    });

    it('allows vendor owner to create category for own branch', async () => {
      const branch = makeBranchWithOwner();
      const dto = { name: 'Category', sortOrder: 1 } as any;

      branchesRepository.findOne.mockResolvedValue(branch as any);

      await expect(
        service.createCategoryForBranch(branch.id, dto, vendorUser),
      ).resolves.toBeDefined();
    });

    it('rejects vendor manager for branch they do not own', async () => {
      const branch = makeBranchWithOwner();
      const dto = { name: 'Category' } as any;

      branchesRepository.findOne.mockResolvedValue(branch as any);

      await expect(
        service.createCategoryForBranch(branch.id, dto, strangerUser),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });
  });

  describe('deleteCategory', () => {
    const makeCategory = () =>
      ({
        id: 'cat-1',
        branch: {
          vendor: { owner: { id: vendorUser.userId } },
        },
      } as any as MenuCategory);

    it('throws NotFoundException when category not found', async () => {
      categoriesRepository.findOne.mockResolvedValue(null as any);

      await expect(service.deleteCategory('missing', adminUser)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('allows admin to delete any category', async () => {
      const category = makeCategory();
      categoriesRepository.findOne.mockResolvedValue(category as any);

      await expect(service.deleteCategory(category.id, adminUser)).resolves.toBeUndefined();
      expect(categoriesRepository.delete).toHaveBeenCalledWith(category.id);
    });

    it('rejects vendor manager who is not owner', async () => {
      const category = makeCategory();
      categoriesRepository.findOne.mockResolvedValue(category as any);

      await expect(
        service.deleteCategory(category.id, strangerUser),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });
  });

  describe('createItemForCategory', () => {
    const makeCategory = () =>
      ({
        id: 'cat-1',
        branch: {
          vendor: { owner: { id: vendorUser.userId } },
        },
      } as any as MenuCategory);

    it('allows vendor owner to create item under own category', async () => {
      const category = makeCategory();
      const dto = {
        name: 'Item',
        basePrice: 100,
      } as any;
      const item = { id: 'item-1' } as MenuItem;

      categoriesRepository.findOne.mockResolvedValue(category as any);
      itemsRepository.create.mockReturnValue(item);
      itemsRepository.save.mockResolvedValue(item);

      const result = await service.createItemForCategory(category.id, dto, vendorUser);

      expect(itemsRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          category,
          name: dto.name,
          basePrice: dto.basePrice,
        }),
      );
      expect(result).toBe(item);
    });

    it('rejects vendor manager for category they do not own', async () => {
      const category = makeCategory();
      categoriesRepository.findOne.mockResolvedValue(category as any);

      await expect(
        service.createItemForCategory(category.id, { name: 'Item' } as any, strangerUser),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });
  });

  describe('updateItem', () => {
    const makeItem = () =>
      ({
        id: 'item-1',
        name: 'Old',
        category: {
          branch: {
            vendor: { owner: { id: vendorUser.userId } },
          },
        },
      } as any as MenuItem);

    it('throws NotFoundException when item not found', async () => {
      itemsRepository.findOne.mockResolvedValue(null as any);

      await expect(service.updateItem('missing', {} as any, adminUser)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('updates item when user can manage branch', async () => {
      const item = makeItem();
      const dto = { name: 'Updated' } as any;
      itemsRepository.findOne.mockResolvedValue(item as any);
      itemsRepository.save.mockImplementation(async (v: any) => v);

      const result = await service.updateItem(item.id, dto, vendorUser);

      expect(result.name).toBe('Updated');
    });
  });

  describe('createOptionForItem', () => {
    const makeItem = () =>
      ({
        id: 'item-1',
        category: {
          branch: {
            vendor: { owner: { id: vendorUser.userId } },
          },
        },
      } as any as MenuItem);

    it('allows vendor owner to create option for own item', async () => {
      const item = makeItem();
      const dto = { type: 'size', name: 'Large', priceDelta: 20 } as any;
      const option = { id: 'opt-1' } as MenuOption;

      itemsRepository.findOne.mockResolvedValue(item as any);
      optionsRepository.create.mockReturnValue(option);
      optionsRepository.save.mockResolvedValue(option);

      const result = await service.createOptionForItem(item.id, dto, vendorUser);

      expect(optionsRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          item,
          type: dto.type,
          name: dto.name,
          priceDelta: dto.priceDelta,
        }),
      );
      expect(result).toBe(option);
    });
  });

  describe('deleteOption', () => {
    const makeOption = () =>
      ({
        id: 'opt-1',
        item: {
          category: {
            branch: {
              vendor: { owner: { id: vendorUser.userId } },
            },
          },
        },
      } as any as MenuOption);

    it('throws NotFoundException when option not found', async () => {
      optionsRepository.findOne.mockResolvedValue(null as any);

      await expect(service.deleteOption('missing', adminUser)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('allows admin to delete option', async () => {
      const option = makeOption();
      optionsRepository.findOne.mockResolvedValue(option as any);

      await expect(service.deleteOption(option.id, adminUser)).resolves.toBeUndefined();
      expect(optionsRepository.delete).toHaveBeenCalledWith(option.id);
    });
  });
});
