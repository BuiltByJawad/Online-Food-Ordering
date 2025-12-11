import { IsInt, IsOptional, IsPositive, IsUUID } from 'class-validator';

export class AddCartItemDto {
  @IsUUID()
  menuItemId: string;

  @IsInt()
  @IsPositive()
  quantity: number;

  @IsUUID()
  @IsOptional()
  branchId?: string | null;
}
