import { IsIn, IsString } from 'class-validator';

export class UpdateOrderStatusDto {
  @IsString()
  @IsIn(['created', 'accepted', 'preparing', 'completed', 'cancelled'])
  status: string;
}
