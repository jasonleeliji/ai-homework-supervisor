import { IsString, Length } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @Length(11, 11)
  phone: string;

  @IsString()
  @Length(6, 6)
  code: string;
}