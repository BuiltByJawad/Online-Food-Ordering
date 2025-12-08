import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Address } from './address.entity';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { User } from '../users/user.entity';

@Injectable()
export class AddressesService {
  constructor(
    @InjectRepository(Address)
    private readonly addressesRepository: Repository<Address>,
  ) {}

  findForUser(userId: string): Promise<Address[]> {
    return this.addressesRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }

  async createForUser(user: User, dto: CreateAddressDto): Promise<Address> {
    const address = this.addressesRepository.create({
      ...dto,
      user,
    });

    if (dto.isDefault) {
      await this.clearDefaultForUser(user.id);
      address.isDefault = true;
    }

    return this.addressesRepository.save(address);
  }

  async updateForUser(
    userId: string,
    id: string,
    dto: UpdateAddressDto,
  ): Promise<Address> {
    const address = await this.addressesRepository.findOne({
      where: { id, user: { id: userId } },
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    if (dto.isDefault) {
      await this.clearDefaultForUser(userId);
    }

    Object.assign(address, dto);
    return this.addressesRepository.save(address);
  }

  async deleteForUser(userId: string, id: string): Promise<void> {
    const result = await this.addressesRepository.delete({
      id,
      user: { id: userId },
    } as any);

    if (result.affected === 0) {
      throw new NotFoundException('Address not found');
    }
  }

  private async clearDefaultForUser(userId: string): Promise<void> {
    await this.addressesRepository.update(
      { user: { id: userId } } as any,
      { isDefault: false },
    );
  }
}
