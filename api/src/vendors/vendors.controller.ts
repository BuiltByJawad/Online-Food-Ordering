import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { VendorsService } from './vendors.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/user-role.enum';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';

@Controller('vendors')
@UseGuards(JwtAuthGuard, RolesGuard)
export class VendorsController {
  constructor(private readonly vendorsService: VendorsService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() dto: CreateVendorDto) {
    return this.vendorsService.createVendor(dto);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.vendorsService.findAllVendors();
  }

  @Get('me')
  @Roles(UserRole.VENDOR_MANAGER)
  async findMyVendor(@CurrentUser() user: any) {
    const vendor = await this.vendorsService.findVendorByOwner(user.userId);
    if (!vendor) {
      throw new NotFoundException('Vendor not found for current user');
    }
    return vendor;
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  findOne(@Param('id') id: string) {
    return this.vendorsService.findVendorByIdOrFail(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateVendorDto) {
    return this.vendorsService.updateVendor(id, dto);
  }

  @Post(':vendorId/branches')
  @Roles(UserRole.ADMIN, UserRole.VENDOR_MANAGER)
  async createBranch(
    @Param('vendorId') vendorId: string,
    @Body() dto: CreateBranchDto,
    @CurrentUser() user: any,
  ) {
    const vendor = await this.vendorsService.findVendorByIdOrFail(vendorId);

    if (
      user.role === UserRole.VENDOR_MANAGER &&
      vendor.owner.id !== user.userId
    ) {
      throw new ForbiddenException('You do not have access to this vendor');
    }

    return this.vendorsService.createBranchForVendor(vendorId, dto);
  }

  @Get(':vendorId/branches')
  @Roles(UserRole.ADMIN, UserRole.VENDOR_MANAGER)
  async findBranches(
    @Param('vendorId') vendorId: string,
    @CurrentUser() user: any,
  ) {
    const vendor = await this.vendorsService.findVendorByIdOrFail(vendorId);

    if (
      user.role === UserRole.VENDOR_MANAGER &&
      vendor.owner.id !== user.userId
    ) {
      throw new ForbiddenException('You do not have access to this vendor');
    }

    return this.vendorsService.findBranchesForVendor(vendorId);
  }

  @Patch(':vendorId/branches/:branchId')
  @Roles(UserRole.ADMIN, UserRole.VENDOR_MANAGER)
  async updateBranch(
    @Param('vendorId') vendorId: string,
    @Param('branchId') branchId: string,
    @Body() dto: UpdateBranchDto,
    @CurrentUser() user: any,
  ) {
    const vendor = await this.vendorsService.findVendorByIdOrFail(vendorId);

    if (
      user.role === UserRole.VENDOR_MANAGER &&
      vendor.owner.id !== user.userId
    ) {
      throw new ForbiddenException('You do not have access to this vendor');
    }

    return this.vendorsService.updateBranchForVendor(vendorId, branchId, dto);
  }

  @Delete(':vendorId/branches/:branchId')
  @Roles(UserRole.ADMIN, UserRole.VENDOR_MANAGER)
  async deleteBranch(
    @Param('vendorId') vendorId: string,
    @Param('branchId') branchId: string,
    @CurrentUser() user: any,
  ) {
    const vendor = await this.vendorsService.findVendorByIdOrFail(vendorId);

    if (
      user.role === UserRole.VENDOR_MANAGER &&
      vendor.owner.id !== user.userId
    ) {
      throw new ForbiddenException('You do not have access to this vendor');
    }

    return this.vendorsService.deleteBranchForVendor(vendorId, branchId);
  }
}
