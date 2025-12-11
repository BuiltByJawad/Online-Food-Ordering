import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { Order } from './order.entity';
import { MenuItem } from '../menu/menu-item.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { Address } from '../addresses/address.entity';
import { Branch } from '../vendors/branch.entity';
import { UserRole } from '../users/user-role.enum';
import { UsersService } from '../users/users.service';
import { OrdersNotificationsService } from './orders-notifications.service';

const createOrderRepositoryMock = () => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
}) as unknown as jest.Mocked<Repository<Order>>;

const createMenuItemRepositoryMock = () => ({
  findOne: jest.fn(),
}) as unknown as jest.Mocked<Repository<MenuItem>>;

const createAddressRepositoryMock = () => ({
  findOne: jest.fn(),
}) as unknown as jest.Mocked<Repository<Address>>;

const createBranchRepositoryMock = () => ({
  findOne: jest.fn(),
}) as unknown as jest.Mocked<Repository<Branch>>;

const createUsersServiceMock = () => ({
  findById: jest.fn(),
}) as unknown as jest.Mocked<UsersService>;

const createNotificationsServiceMock = () =>
  ({
    notifyStatusChange: jest.fn(),
  }) as unknown as jest.Mocked<OrdersNotificationsService>;

describe('OrdersService', () => {
  let service: OrdersService;
  let ordersRepository: jest.Mocked<Repository<Order>>;
  let itemsRepository: jest.Mocked<Repository<MenuItem>>;
  let addressesRepository: jest.Mocked<Repository<Address>>;
  let branchesRepository: jest.Mocked<Repository<Branch>>;
  let usersService: jest.Mocked<UsersService>;
  let notificationsService: jest.Mocked<OrdersNotificationsService>;

  beforeEach(async () => {
    ordersRepository = createOrderRepositoryMock();
    itemsRepository = createMenuItemRepositoryMock();
    addressesRepository = createAddressRepositoryMock();
    branchesRepository = createBranchRepositoryMock();
    usersService = createUsersServiceMock();
    notificationsService = createNotificationsServiceMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: getRepositoryToken(Order),
          useValue: ordersRepository,
        },
        {
          provide: getRepositoryToken(MenuItem),
          useValue: itemsRepository,
        },
        {
          provide: getRepositoryToken(Address),
          useValue: addressesRepository,
        },
        {
          provide: getRepositoryToken(Branch),
          useValue: branchesRepository,
        },
        {
          provide: UsersService,
          useValue: usersService,
        },
        {
          provide: OrdersNotificationsService,
          useValue: notificationsService,
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  describe('createForUser', () => {
    const userId = 'user-1';

    it('creates an order with correct lines, total, and branchId when all items exist', async () => {
      const dto: CreateOrderDto = {
        items: [
          { itemId: 'item-1', quantity: 2 },
          { itemId: 'item-2', quantity: 1 },
        ],
        branchId: 'branch-1',
      };

      const item1 = {
        id: 'item-1',
        name: 'Burger',
        basePrice: 100,
      } as unknown as MenuItem;

      const item2 = {
        id: 'item-2',
        name: 'Fries',
        basePrice: 50,
      } as unknown as MenuItem;

      itemsRepository.findOne
        .mockResolvedValueOnce(item1 as any)
        .mockResolvedValueOnce(item2 as any);

      const createdOrder = {
        id: 'order-1',
      } as Order;

      ordersRepository.create.mockReturnValue(createdOrder);
      ordersRepository.save.mockResolvedValue(createdOrder);

      const result = await service.createForUser(userId, dto);

      const expectedTotal = 100 * 2 + 50 * 1;

      expect(ordersRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          user: { id: userId },
          items: [
            {
              itemId: 'item-1',
              name: 'Burger',
              basePrice: 100,
              quantity: 2,
            },
            {
              itemId: 'item-2',
              name: 'Fries',
              basePrice: 50,
              quantity: 1,
            },
          ],
          totalAmount: expectedTotal,
          status: 'created',
          branchId: dto.branchId,
          deliveryAddress: null,
        }),
      );

      expect(ordersRepository.save).toHaveBeenCalledWith(createdOrder);
      expect(result).toBe(createdOrder);
    });

    it('creates an order with a deliveryAddress snapshot when addressId is provided', async () => {
      const dto: CreateOrderDto = {
        items: [{ itemId: 'item-1', quantity: 1 }],
        addressId: 'addr-1',
      };

      const item = {
        id: 'item-1',
        name: 'Burger',
        basePrice: 100,
      } as unknown as MenuItem;

      const address = {
        id: 'addr-1',
        label: 'Home',
        line1: '123 Street',
        line2: 'Apt 4',
        city: 'Dhaka',
        postalCode: '1234',
        country: 'BD',
      } as unknown as Address;

      itemsRepository.findOne.mockResolvedValue(item as any);
      addressesRepository.findOne.mockResolvedValue(address as any);

      const createdOrder = { id: 'order-1' } as Order;
      ordersRepository.create.mockReturnValue(createdOrder);
      ordersRepository.save.mockResolvedValue(createdOrder);

      const result = await service.createForUser(userId, dto);

      expect(addressesRepository.findOne).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: dto.addressId, user: { id: userId } } }),
      );

      expect(ordersRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          user: { id: userId },
          deliveryAddress: {
            addressId: address.id,
            label: address.label,
            line1: address.line1,
            line2: address.line2,
            city: address.city,
            postalCode: address.postalCode,
            country: address.country,
          },
        }),
      );

      expect(result).toBe(createdOrder);
    });

    it('throws NotFoundException when a menu item does not exist', async () => {
      const dto: CreateOrderDto = {
        items: [{ itemId: 'missing', quantity: 1 }],
      };

      itemsRepository.findOne.mockResolvedValue(null as any);

      await expect(service.createForUser(userId, dto)).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(ordersRepository.create).not.toHaveBeenCalled();
      expect(ordersRepository.save).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when addressId is provided but address is not found', async () => {
      const dto: CreateOrderDto = {
        items: [{ itemId: 'item-1', quantity: 1 }],
        addressId: 'missing',
      };

      const item = {
        id: 'item-1',
        name: 'Burger',
        basePrice: 100,
      } as unknown as MenuItem;

      itemsRepository.findOne.mockResolvedValue(item as any);
      addressesRepository.findOne.mockResolvedValue(null as any);

      await expect(service.createForUser(userId, dto)).rejects.toBeInstanceOf(
        NotFoundException,
      );

      expect(ordersRepository.create).not.toHaveBeenCalled();
      expect(ordersRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('findForUser', () => {
    it('returns orders for a user ordered by createdAt DESC', async () => {
      const userId = 'user-1';
      const orders: Order[] = [
        { id: 'order-1' } as Order,
        { id: 'order-2' } as Order,
      ];

      ordersRepository.find.mockResolvedValue(orders as any);

      const result = await service.findForUser(userId);

      expect(ordersRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { user: { id: userId } },
          order: { createdAt: 'DESC' },
        }),
      );
      expect(result).toBe(orders);
    });
  });

  describe('findForRider', () => {
    it('returns orders for a rider ordered by createdAt DESC', async () => {
      const riderId = 'rider-1';
      const orders: Order[] = [
        { id: 'order-1' } as Order,
        { id: 'order-2' } as Order,
      ];

      ordersRepository.find.mockResolvedValue(orders as any);

      const result = await service.findForRider(riderId);

      expect(ordersRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { rider: { id: riderId } },
          order: { createdAt: 'DESC' },
        }),
      );
      expect(result).toBe(orders);
    });
  });

  describe('findForBranchManagedBy', () => {
    const branchId = 'branch-1';

    const makeBranch = (ownerUserId: string): Branch =>
      ({
        id: branchId,
        vendor: {
          id: 'vendor-1',
          owner: { id: ownerUserId },
        },
      } as unknown as Branch);

    it('returns orders for branch when user is admin', async () => {
      const user = { userId: 'admin-1', role: UserRole.ADMIN };
      const branch = makeBranch('owner-1');
      const orders: Order[] = [{ id: 'order-1' } as Order];

      branchesRepository.findOne.mockResolvedValue(branch as any);
      ordersRepository.find.mockResolvedValue(orders as any);

      const result = await service.findForBranchManagedBy(branchId, user);

      expect(branchesRepository.findOne).toHaveBeenCalledWith({
        where: { id: branchId },
        relations: ['vendor', 'vendor.owner'],
      });
      expect(ordersRepository.find).toHaveBeenCalledWith({
        where: { branchId },
        order: { createdAt: 'DESC' },
        relations: ['rider'],
      });
      expect(result).toBe(orders);
    });

    it('returns orders when vendor manager owns the branch', async () => {
      const user = { userId: 'owner-1', role: UserRole.VENDOR_MANAGER };
      const branch = makeBranch(user.userId);
      const orders: Order[] = [{ id: 'order-1' } as Order];

      branchesRepository.findOne.mockResolvedValue(branch as any);
      ordersRepository.find.mockResolvedValue(orders as any);

      const result = await service.findForBranchManagedBy(branchId, user);

      expect(result).toBe(orders);
    });

    it('throws ForbiddenException when vendor manager does not own the branch', async () => {
      const user = { userId: 'owner-2', role: UserRole.VENDOR_MANAGER };
      const branch = makeBranch('owner-1');

      branchesRepository.findOne.mockResolvedValue(branch as any);

      await expect(
        service.findForBranchManagedBy(branchId, user),
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(ordersRepository.find).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when branch does not exist', async () => {
      const user = { userId: 'admin-1', role: UserRole.ADMIN };
      branchesRepository.findOne.mockResolvedValue(null as any);

      await expect(
        service.findForBranchManagedBy(branchId, user),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(ordersRepository.find).not.toHaveBeenCalled();
    });
  });

  describe('updateStatusForBranchManagedBy', () => {
    const orderId = 'order-1';

    const makeBranch = (ownerUserId: string): Branch =>
      ({
        id: 'branch-1',
        vendor: {
          id: 'vendor-1',
          owner: { id: ownerUserId },
        },
      } as unknown as Branch);

    it('throws NotFoundException when order does not exist', async () => {
      ordersRepository.findOne.mockResolvedValue(null as any);

      await expect(
        service.updateStatusForBranchManagedBy(orderId, 'completed', {
          userId: 'admin-1',
          role: UserRole.ADMIN,
        }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws NotFoundException when order has no branchId', async () => {
      const order = { id: orderId, branchId: null } as unknown as Order;
      ordersRepository.findOne.mockResolvedValue(order as any);

      await expect(
        service.updateStatusForBranchManagedBy(orderId, 'completed', {
          userId: 'admin-1',
          role: UserRole.ADMIN,
        }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('updates status when user is admin and branch is found', async () => {
      const order = {
        id: orderId,
        branchId: 'branch-1',
        status: 'created',
      } as unknown as Order;
      const branch = makeBranch('owner-1');

      ordersRepository.findOne.mockResolvedValue(order as any);
      branchesRepository.findOne.mockResolvedValue(branch as any);
      ordersRepository.save.mockImplementation(async (o: any) => o as Order);

      const result = await service.updateStatusForBranchManagedBy(
        orderId,
        'completed',
        { userId: 'admin-1', role: UserRole.ADMIN },
      );

      expect(branchesRepository.findOne).toHaveBeenCalledWith({
        where: { id: order.branchId },
        relations: ['vendor', 'vendor.owner'],
      });
      expect(order.status).toBe('completed');
      expect(ordersRepository.save).toHaveBeenCalledWith(order);
      expect(result).toBe(order);
    });

    it('throws ForbiddenException when vendor manager does not own the branch', async () => {
      const order = {
        id: orderId,
        branchId: 'branch-1',
        status: 'created',
      } as unknown as Order;
      const branch = makeBranch('owner-1');

      ordersRepository.findOne.mockResolvedValue(order as any);
      branchesRepository.findOne.mockResolvedValue(branch as any);

      await expect(
        service.updateStatusForBranchManagedBy(orderId, 'completed', {
          userId: 'owner-2',
          role: UserRole.VENDOR_MANAGER,
        }),
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(ordersRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('assignRiderForBranchManagedBy', () => {
    const orderId = 'order-1';
    const riderUserId = 'rider-1';

    const makeBranch = (ownerUserId: string): Branch =>
      ({
        id: 'branch-1',
        vendor: {
          id: 'vendor-1',
          owner: { id: ownerUserId },
        },
      } as unknown as Branch);

    it('throws NotFoundException when order does not exist', async () => {
      ordersRepository.findOne.mockResolvedValue(null as any);

      await expect(
        service.assignRiderForBranchManagedBy(orderId, riderUserId, {
          userId: 'admin-1',
          role: UserRole.ADMIN,
        }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws NotFoundException when order has no branchId', async () => {
      const order = { id: orderId, branchId: null } as unknown as Order;
      ordersRepository.findOne.mockResolvedValue(order as any);

      await expect(
        service.assignRiderForBranchManagedBy(orderId, riderUserId, {
          userId: 'admin-1',
          role: UserRole.ADMIN,
        }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws NotFoundException when rider user does not exist', async () => {
      const order = { id: orderId, branchId: 'branch-1' } as unknown as Order;
      const branch = makeBranch('owner-1');

      ordersRepository.findOne.mockResolvedValue(order as any);
      branchesRepository.findOne.mockResolvedValue(branch as any);
      usersService.findById.mockResolvedValue(null as any);

      await expect(
        service.assignRiderForBranchManagedBy(orderId, riderUserId, {
          userId: 'admin-1',
          role: UserRole.ADMIN,
        }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws BadRequestException when user is not a rider', async () => {
      const order = { id: orderId, branchId: 'branch-1' } as unknown as Order;
      const branch = makeBranch('owner-1');

      const nonRiderUser = { id: riderUserId, role: UserRole.CUSTOMER } as any;

      ordersRepository.findOne.mockResolvedValue(order as any);
      branchesRepository.findOne.mockResolvedValue(branch as any);
      usersService.findById.mockResolvedValue(nonRiderUser as any);

      await expect(
        service.assignRiderForBranchManagedBy(orderId, riderUserId, {
          userId: 'admin-1',
          role: UserRole.ADMIN,
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(ordersRepository.save).not.toHaveBeenCalled();
    });

    it('assigns rider when user can manage branch and rider exists', async () => {
      const order = {
        id: orderId,
        branchId: 'branch-1',
        rider: null,
      } as unknown as Order;
      const branch = makeBranch('owner-1');
      const riderUser = { id: riderUserId, role: UserRole.RIDER } as any;

      ordersRepository.findOne.mockResolvedValue(order as any);
      branchesRepository.findOne.mockResolvedValue(branch as any);
      usersService.findById.mockResolvedValue(riderUser as any);
      ordersRepository.save.mockImplementation(async (o: any) => o as Order);

      const result = await service.assignRiderForBranchManagedBy(
        orderId,
        riderUserId,
        {
          userId: 'admin-1',
          role: UserRole.ADMIN,
        },
      );

      expect(order.rider).toBe(riderUser);
      expect(ordersRepository.save).toHaveBeenCalledWith(order);
      expect(result).toBe(order);
    });
  });

  describe('updateStatusForRider', () => {
    const orderId = 'order-1';

    it('throws NotFoundException when order does not exist', async () => {
      ordersRepository.findOne.mockResolvedValue(null as any);

      await expect(
        service.updateStatusForRider(orderId, 'completed', {
          userId: 'rider-1',
          role: UserRole.RIDER,
        }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws ForbiddenException when order has no rider', async () => {
      const order = { id: orderId, rider: null } as unknown as Order;
      ordersRepository.findOne.mockResolvedValue(order as any);

      await expect(
        service.updateStatusForRider(orderId, 'completed', {
          userId: 'rider-1',
          role: UserRole.RIDER,
        }),
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(ordersRepository.save).not.toHaveBeenCalled();
    });

    it('throws ForbiddenException when rider does not own the order', async () => {
      const order = {
        id: orderId,
        rider: { id: 'other-rider' },
      } as unknown as Order;

      ordersRepository.findOne.mockResolvedValue(order as any);

      await expect(
        service.updateStatusForRider(orderId, 'completed', {
          userId: 'rider-1',
          role: UserRole.RIDER,
        }),
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(ordersRepository.save).not.toHaveBeenCalled();
    });

    it('updates status when rider owns the order', async () => {
      const order = {
        id: orderId,
        rider: { id: 'rider-1' },
        status: 'accepted',
      } as unknown as Order;

      ordersRepository.findOne.mockResolvedValue(order as any);
      ordersRepository.save.mockImplementation(async (o: any) => o as Order);

      const result = await service.updateStatusForRider(orderId, 'completed', {
        userId: 'rider-1',
        role: UserRole.RIDER,
      });

      expect(order.status).toBe('completed');
      expect(ordersRepository.save).toHaveBeenCalledWith(order);
      expect(result).toBe(order);
    });
  });
});
