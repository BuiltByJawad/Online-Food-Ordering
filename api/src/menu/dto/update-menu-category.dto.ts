import { IsInt, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateMenuCategoryDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsInt()
  sortOrder?: number;
}
