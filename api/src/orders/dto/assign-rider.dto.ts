import { IsString, IsUUID } from 'class-validator';

export class AssignRiderDto {
  @IsString()
  @IsUUID()
  riderUserId: string;
}
