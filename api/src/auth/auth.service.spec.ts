import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let usersService: { findByEmail: jest.Mock; create: jest.Mock };
  let jwtService: { sign: jest.Mock };
  let configService: { get: jest.Mock };

  beforeEach(async () => {
    usersService = {
      findByEmail: jest.fn(),
      create: jest.fn(),
    };

    jwtService = {
      sign: jest.fn().mockReturnValue('signed-jwt-token'),
    } as any;

    configService = {
      get: jest.fn().mockReturnValue('10'),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('throws UnauthorizedException when email already exists', async () => {
      usersService.findByEmail.mockResolvedValue({ id: 'user-1' } as User);

      await expect(
        service.register({
          email: 'test@example.com',
          password: 'secret',
          name: 'Test',
          phone: '123',
        } as any),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('creates user and returns token when email is free', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');

      const createdUser = {
        id: 'user-1',
        email: 'test@example.com',
      } as User;
      usersService.create.mockResolvedValue(createdUser);

      const result = await service.register({
        email: 'test@example.com',
        password: 'secret',
        name: 'Test',
        phone: '123',
      } as any);

      expect(usersService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'test@example.com',
          passwordHash: 'hashed-password',
        }),
      );
      expect(result.user).toBe(createdUser);
      expect(result.accessToken).toBe('signed-jwt-token');
    });
  });

  describe('login', () => {
    it('throws UnauthorizedException when user not found', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      await expect(
        service.login({ email: 'missing@example.com', password: 'secret' } as any),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('throws UnauthorizedException when password does not match', async () => {
      const user = { id: 'user-1', email: 'test@example.com', passwordHash: 'hash' } as any;
      usersService.findByEmail.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({ email: user.email, password: 'wrong' } as any),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('returns user and token when credentials are valid', async () => {
      const user = { id: 'user-1', email: 'test@example.com', passwordHash: 'hash' } as any;
      usersService.findByEmail.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login({
        email: user.email,
        password: 'correct',
      } as any);

      expect(result.user).toBe(user);
      expect(result.accessToken).toBe('signed-jwt-token');
      expect(jwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({ sub: user.id, email: user.email }),
      );
    });
  });
});
