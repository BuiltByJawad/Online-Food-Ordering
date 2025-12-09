import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { VendorsService } from './vendors.service';
import { Vendor } from './vendor.entity';
import { Branch } from './branch.entity';
import { UsersService } from '../users/users.service';

// Simple factory to build a mocked TypeORM repository
const createMockRepository = <T>() => ({
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  delete: jest.fn(),
}) as unknown as jest.Mocked<Repository<T>>;

describe('VendorsService', () => {
  let service: VendorsService;
  let vendorsRepository: jest.Mocked<Repository<Vendor>>;
  let branchesRepository: jest.Mocked<Repository<Branch>>;
  let usersService: { findById: jest.Mock };

  beforeEach(async () => {
    vendorsRepository = createMockRepository<Vendor>();
    branchesRepository = createMockRepository<Branch>();
    usersService = {
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VendorsService,
        {
          provide: getRepositoryToken(Vendor),
          useValue: vendorsRepository,
        },
        {
          provide: getRepositoryToken(Branch),
          useValue: branchesRepository,
        },
        {
          provide: UsersService,
          useValue: usersService,
        },
      ],
    }).compile();

    service = module.get<VendorsService>(VendorsService);
  });

  describe('createVendor', () => {
    it('throws BadRequestException when owner user does not exist', async () => {
      usersService.findById.mockResolvedValue(null);

      await expect(
        service.createVendor({
          ownerUserId: 'missing-user',
          name: 'Test Vendor',
          brandName: 'Brand',
          legalName: 'Legal Inc.',
          taxId: 'TAX123',
          logoUrl: null,
          contactEmail: 'vendor@example.com',
          contactPhone: '+123456789',
          commissionRate: 10,
          payoutCycle: 'monthly',
        } as any),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('creates and saves a vendor when owner user exists', async () => {
      const owner = { id: 'user-1' } as any;
      usersService.findById.mockResolvedValue(owner);

      const dto = {
        ownerUserId: owner.id,
        name: 'Test Vendor',
        brandName: 'Brand',
        legalName: 'Legal Inc.',
        taxId: 'TAX123',
        logoUrl: 'http://logo',
        contactEmail: 'vendor@example.com',
        contactPhone: '+123456789',
        commissionRate: 12,
        payoutCycle: 'monthly',
      } as any;

      const vendorEntity = { id: 'vendor-1' } as Vendor;
      vendorsRepository.create.mockReturnValue(vendorEntity);
      vendorsRepository.save.mockResolvedValue(vendorEntity);

      const result = await service.createVendor(dto);

      expect(usersService.findById).toHaveBeenCalledWith(dto.ownerUserId);
      expect(vendorsRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
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
        }),
      );
      expect(vendorsRepository.save).toHaveBeenCalledWith(vendorEntity);
      expect(result).toBe(vendorEntity);
    });
  });

  describe('findVendorByIdOrFail', () => {
    it('throws NotFoundException when vendor does not exist', async () => {
      vendorsRepository.findOne.mockResolvedValue(null as any);

      await expect(service.findVendorByIdOrFail('missing')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('returns vendor when it exists', async () => {
      const vendor = { id: 'vendor-1' } as Vendor;
      vendorsRepository.findOne.mockResolvedValue(vendor as any);

      await expect(service.findVendorByIdOrFail('vendor-1')).resolves.toBe(vendor);
    });
  });

  describe('createBranchForVendor', () => {
    it('throws NotFoundException when vendor does not exist', async () => {
      vendorsRepository.findOne.mockResolvedValue(null as any);

      await expect(
        service.createBranchForVendor('missing-vendor', {
          name: 'Branch',
        } as any),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('creates and saves a branch when vendor exists', async () => {
      const vendor = { id: 'vendor-1' } as Vendor;
      vendorsRepository.findOne.mockResolvedValue(vendor as any);

      const branchEntity = { id: 'branch-1' } as Branch;
      branchesRepository.create.mockReturnValue(branchEntity);
      branchesRepository.save.mockResolvedValue(branchEntity);

      const dto = {
        name: 'Branch',
        addressLine1: 'Line 1',
        addressLine2: 'Line 2',
        city: 'City',
        postalCode: '12345',
        country: 'Country',
        lat: 1.23,
        lng: 4.56,
        openingHours: {},
        deliveryZones: [],
      } as any;

      const result = await service.createBranchForVendor(vendor.id, dto);

      expect(branchesRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
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
        }),
      );
      expect(branchesRepository.save).toHaveBeenCalledWith(branchEntity);
      expect(result).toBe(branchEntity);
    });
  });

  describe('updateBranchForVendor', () => {
    it('throws NotFoundException when branch is not found for vendor', async () => {
      branchesRepository.findOne.mockResolvedValue(null as any);

      await expect(
        service.updateBranchForVendor('vendor-1', 'missing-branch', {
          name: 'Updated',
        } as any),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('updates and saves branch when it exists for vendor', async () => {
      const branch = { id: 'branch-1', name: 'Old' } as Branch;
      branchesRepository.findOne.mockResolvedValue(branch as any);
      branchesRepository.save.mockImplementation(async (b: any) => b);

      const dto = { name: 'Updated' } as any;

      const result = await service.updateBranchForVendor('vendor-1', branch.id, dto);

      expect(branchesRepository.findOne).toHaveBeenCalledWith({
        where: { id: branch.id, vendor: { id: 'vendor-1' } },
      });
      expect(result.name).toBe('Updated');
    });
  });

  describe('deleteBranchForVendor', () => {
    it('throws NotFoundException when delete affects zero rows', async () => {
      (branchesRepository.delete as any).mockResolvedValue({ affected: 0 });

      await expect(
        service.deleteBranchForVendor('vendor-1', 'branch-1'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('succeeds silently when delete affects at least one row', async () => {
      (branchesRepository.delete as any).mockResolvedValue({ affected: 1 });

      await expect(
        service.deleteBranchForVendor('vendor-1', 'branch-1'),
      ).resolves.toBeUndefined();
    });
  });
}
