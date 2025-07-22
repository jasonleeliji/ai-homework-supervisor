import { IsString, IsNumber, IsEnum, IsOptional, Min, Max } from 'class-validator';
import { Gender } from '../schemas/user.schema';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  nickname?: string;

  @IsOptional()
  @IsNumber()
  @Min(3)
  @Max(18)
  age?: number;

  @IsOptional()
  @IsString()
  grade?: string;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;
}