import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { Order } from './order.entity';
import { MenuItem } from '../menu/menu-item.entity';
import { CreateOrderDto } from './dto/create-order.dto';

const createOrderRepositoryMock = () => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
}) as unknown as jest.Mocked<Repository<Order>>;

const createMenuItemRepositoryMock = () => ({
  findOne: jest.fn(),
}) as unknown as jest.Mocked<Repository<MenuItem>>;

describe('OrdersService', () => {
  let service: OrdersService;
  let ordersRepository: jest.Mocked<Repository<Order>>;
  let itemsRepository: jest.Mocked<Repository<MenuItem>>;

  beforeEach(async () => {
    ordersRepository = createOrderRepositoryMock();
    itemsRepository = createMenuItemRepositoryMock();

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
        }),
      );

      expect(ordersRepository.save).toHaveBeenCalledWith(createdOrder);
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
});
