import { IsInt, IsOptional } from 'class-validator';

export class CreateSessionDto {
  @IsInt()
  @IsOptional()
  userId?: number;
}
