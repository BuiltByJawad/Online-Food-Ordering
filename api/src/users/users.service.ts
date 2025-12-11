import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { UserRole } from './user-role.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async create(user: Partial<User>): Promise<User> {
    const entity = this.usersRepository.create(user);
    return this.usersRepository.save(entity);
  }

  findAll(): Promise<User[]> {
    return this.usersRepository.find({ order: { createdAt: 'DESC' } });
  }

  async updateProfile(
    id: string,
    data: Partial<Pick<User, 'name' | 'phone'>>,
  ): Promise<User> {
    await this.usersRepository.update(id, data);
    const updated = await this.findById(id);
    if (!updated) {
      throw new Error('User not found after update');
    }
    return updated;
  }

  async updateRole(id: string, role: User['role']): Promise<User> {
    await this.usersRepository.update(id, { role });
    const updated = await this.findById(id);
    if (!updated) {
      throw new Error('User not found after role update');
    }
    return updated;
  }

  async findRiders(query?: string): Promise<User[]> {
    const qb = this.usersRepository
      .createQueryBuilder('user')
      .where('user.role = :role', { role: UserRole.RIDER })
      .orderBy('user.createdAt', 'DESC')
      .select(['user.id', 'user.email', 'user.name', 'user.role']);

    if (query && query.trim().length > 0) {
      qb.andWhere('LOWER(user.email) LIKE :q', {
        q: `%${query.toLowerCase()}%`,
      });
    }

    return qb.getMany();
  }
}
