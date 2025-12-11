import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from './users.service';
import { User } from './user.entity';

const createUserRepositoryMock = () => ({
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
}) as unknown as jest.Mocked<Repository<User>>;

describe('UsersService', () => {
  let service: UsersService;
  let usersRepository: jest.Mocked<Repository<User>>;

  beforeEach(async () => {
    usersRepository = createUserRepositoryMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: usersRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  describe('findById', () => {
    it('delegates to repository.findOne with id', async () => {
      const user = { id: 'user-1' } as User;
      usersRepository.findOne.mockResolvedValue(user as any);

      const result = await service.findById('user-1');

      expect(usersRepository.findOne).toHaveBeenCalledWith({ where: { id: 'user-1' } });
      expect(result).toBe(user);
    });
  });

  describe('findByEmail', () => {
    it('delegates to repository.findOne with email', async () => {
      const user = { id: 'user-1', email: 'test@example.com' } as User;
      usersRepository.findOne.mockResolvedValue(user as any);

      const result = await service.findByEmail('test@example.com');

      expect(usersRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(result).toBe(user);
    });
  });

  describe('create', () => {
    it('creates and saves a user', async () => {
      const dto = { email: 'test@example.com' } as Partial<User>;
      const entity = { id: 'user-1', ...dto } as User;

      usersRepository.create.mockReturnValue(entity);
      usersRepository.save.mockResolvedValue(entity);

      const result = await service.create(dto);

      expect(usersRepository.create).toHaveBeenCalledWith(dto);
      expect(usersRepository.save).toHaveBeenCalledWith(entity);
      expect(result).toBe(entity);
    });
  });

  describe('findAll', () => {
    it('returns users ordered by createdAt descending', async () => {
      const users = [
        { id: 'user-2', createdAt: new Date('2023-01-02') } as User,
        { id: 'user-1', createdAt: new Date('2023-01-01') } as User,
      ];

      usersRepository.find.mockResolvedValue(users as any);

      const result = await service.findAll();

      expect(usersRepository.find).toHaveBeenCalledWith({
        order: { createdAt: 'DESC' },
      });
      expect(result).toBe(users);
    });
  });

  describe('updateProfile', () => {
    it('updates profile and returns updated user', async () => {
      const existing = {
        id: 'user-1',
        name: 'Old Name',
        phone: '123',
      } as User;

      const updated = {
        ...existing,
        name: 'New Name',
      } as User;

      usersRepository.update.mockResolvedValue({} as any);
      usersRepository.findOne.mockResolvedValueOnce(existing as any).mockResolvedValueOnce(
        updated as any,
      );

      const result = await service.updateProfile('user-1', { name: 'New Name' });

      expect(usersRepository.update).toHaveBeenCalledWith('user-1', {
        name: 'New Name',
      });
      expect(result).toBe(updated);
    });

    it('throws when user cannot be found after update', async () => {
      usersRepository.update.mockResolvedValue({} as any);
      usersRepository.findOne.mockResolvedValue(null as any);

      await expect(service.updateProfile('user-1', { name: 'New Name' })).rejects.toThrow(
        'User not found after update',
      );
    });
  });

  describe('updateRole', () => {
    it('updates role and returns updated user', async () => {
      const updated = {
        id: 'user-1',
        role: 'vendor_manager',
      } as unknown as User;

      usersRepository.update.mockResolvedValue({} as any);
      usersRepository.findOne.mockResolvedValue(updated as any);

      const result = await service.updateRole('user-1', updated.role);

      expect(usersRepository.update).toHaveBeenCalledWith('user-1', {
        role: updated.role,
      });
      expect(result).toBe(updated);
    });

    it('throws when user cannot be found after role update', async () => {
      usersRepository.update.mockResolvedValue({} as any);
      usersRepository.findOne.mockResolvedValue(null as any);

      await expect(service.updateRole('user-1', 'vendor_manager' as any)).rejects.toThrow(
        'User not found after role update',
      );
    });
  });
});
