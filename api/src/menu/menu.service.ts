import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MenuItem } from './menu-item.entity';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';

@Injectable()
export class MenuService {
  constructor(
    @InjectRepository(MenuItem)
    private readonly menuRepository: Repository<MenuItem>,
  ) {}

  create(dto: CreateMenuItemDto) {
    const item = this.menuRepository.create(dto);
    return this.menuRepository.save(item);
  }

  findOne(id: string) {
    return this.menuRepository.findOne({ where: { id } });
  }

  findAll(branchId?: string) {
    if (branchId) {
      return this.menuRepository.find({
        where: { branchId, isAvailable: true },
        order: { name: 'ASC' },
      });
    }
    return this.menuRepository.find({ where: { isAvailable: true }, order: { name: 'ASC' } });
  }
}
