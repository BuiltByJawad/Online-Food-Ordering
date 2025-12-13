import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export class CreatePromotionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(32)
  code: string;

  @IsEnum(['percent', 'fixed'])
  discountType: 'percent' | 'fixed';

  @IsNumber()
  @Min(0.01)
  discountValue: number;

  @IsOptional()
  @IsNumber()
  @Min(0.01)
  maxDiscount?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  maxUses?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  perUserLimit?: number;

  @IsOptional()
  validFrom?: Date;

  @IsOptional()
  validTo?: Date;

  @IsOptional()
  @IsUUID()
  branchId?: string;

  @IsOptional()
  @IsString()
  status?: 'active' | 'inactive';
}
