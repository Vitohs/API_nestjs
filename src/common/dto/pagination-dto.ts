import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class PaginationDTO {
  @IsInt()
  @IsOptional()
  @Max(25)
  @Min(0)
  @Type(() => Number)
  public limit: number;

  @IsInt()
  @Type(() => Number)
  @Min(0)
  @IsOptional()
  public offset: number;
}
