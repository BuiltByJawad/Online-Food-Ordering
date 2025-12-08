import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AddressesService } from './addresses.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { UsersService } from '../users/users.service';

@Controller('addresses')
@UseGuards(JwtAuthGuard)
export class AddressesController {
  constructor(
    private readonly addressesService: AddressesService,
    private readonly usersService: UsersService,
  ) {}

  @Get()
  findForCurrentUser(@CurrentUser() user: any) {
    return this.addressesService.findForUser(user.userId);
  }

  @Post()
  async createForCurrentUser(
    @CurrentUser() user: any,
    @Body() dto: CreateAddressDto,
  ) {
    const dbUser = await this.usersService.findById(user.userId);
    if (!dbUser) {
      throw new Error('User not found');
    }
    return this.addressesService.createForUser(dbUser, dto);
  }

  @Patch(':id')
  updateForCurrentUser(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateAddressDto,
  ) {
    return this.addressesService.updateForUser(user.userId, id, dto);
  }

  @Delete(':id')
  deleteForCurrentUser(@CurrentUser() user: any, @Param('id') id: string) {
    return this.addressesService.deleteForUser(user.userId, id);
  }
}
