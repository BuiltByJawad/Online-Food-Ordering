import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vendor } from './vendor.entity';
import { Branch } from './branch.entity';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class VendorsService {
  constructor(
    @InjectRepository(Vendor)
    private readonly vendorsRepository: Repository<Vendor>,
    @InjectRepository(Branch)
    private readonly branchesRepository: Repository<Branch>,
    private readonly usersService: UsersService,
  ) {}

  async createVendor(dto: CreateVendorDto): Promise<Vendor> {
    const owner = await this.usersService.findById(dto.ownerUserId);

    if (!owner) {
      throw new BadRequestException('Owner user not found');
    }

    const vendor = this.vendorsRepository.create({
      name: dto.name,
      brandName: dto.brandName,
      legalName: dto.legalName,
      taxId: dto.taxId,
      logoUrl: dto.logoUrl,
      contactEmail: dto.contactEmail,
      contactPhone: dto.contactPhone,
      commissionRate: dto.commissionRate,
      payoutCycle: dto.payoutCycle,
      owner,
    });

    return this.vendorsRepository.save(vendor);
  }

  findAllVendors(): Promise<Vendor[]> {
    return this.vendorsRepository.find({ relations: ['owner'] });
  }

  async findVendorByIdOrFail(id: string): Promise<Vendor> {
    const vendor = await this.vendorsRepository.findOne({
      where: { id },
      relations: ['owner'],
    });

    if (!vendor) {
      throw new NotFoundException('Vendor not found');
    }

    return vendor;
  }

  async findVendorByOwner(ownerUserId: string): Promise<Vendor | null> {
    const vendor = await this.vendorsRepository.findOne({
      where: { owner: { id: ownerUserId } },
      relations: ['owner'],
    });

    return vendor ?? null;
  }

  async updateVendor(id: string, dto: UpdateVendorDto): Promise<Vendor> {
    const vendor = await this.findVendorByIdOrFail(id);

    Object.assign(vendor, dto);
    return this.vendorsRepository.save(vendor);
  }

  async createBranchForVendor(
    vendorId: string,
    dto: CreateBranchDto,
  ): Promise<Branch> {
    const vendor = await this.findVendorByIdOrFail(vendorId);

    const branch = this.branchesRepository.create({
      vendor,
      name: dto.name,
      addressLine1: dto.addressLine1,
      addressLine2: dto.addressLine2,
      city: dto.city,
      postalCode: dto.postalCode,
      country: dto.country,
      lat: dto.lat,
      lng: dto.lng,
      openingHours: dto.openingHours,
      deliveryZones: dto.deliveryZones,
    });

    return this.branchesRepository.save(branch);
  }

  async findBranchesForVendor(vendorId: string): Promise<Branch[]> {
    return this.branchesRepository.find({
      where: { vendor: { id: vendorId } },
      order: { createdAt: 'DESC' },
    });
  }

  async updateBranchForVendor(
    vendorId: string,
    branchId: string,
    dto: UpdateBranchDto,
  ): Promise<Branch> {
    const branch = await this.branchesRepository.findOne({
      where: { id: branchId, vendor: { id: vendorId } },
    });

    if (!branch) {
      throw new NotFoundException('Branch not found');
    }

    Object.assign(branch, dto);
    return this.branchesRepository.save(branch);
  }

  async deleteBranchForVendor(vendorId: string, branchId: string): Promise<void> {
    const result = await this.branchesRepository.delete({
      id: branchId,
      vendor: { id: vendorId },
    } as any);

    if (result.affected === 0) {
      throw new NotFoundException('Branch not found');
    }
  }
}
