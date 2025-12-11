<<<<<<< HEAD
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
=======
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
>>>>>>> fd897c04ea83262b56abf608b5aae4be4db3f547

export class CreateMenuItemDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

<<<<<<< HEAD
  @IsString()
  @IsOptional()
  description?: string | null;

  @IsNumber()
  price: number;

  @IsUUID()
  @IsOptional()
  branchId?: string | null;

  @IsBoolean()
  @IsOptional()
  isAvailable?: boolean;
=======
  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(512)
  imageUrl?: string;

  @IsNumber()
  basePrice: number;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  taxCategory?: string;

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @IsOptional()
  @IsObject()
  availabilitySchedule?: Record<string, any>;
>>>>>>> fd897c04ea83262b56abf608b5aae4be4db3f547
}
