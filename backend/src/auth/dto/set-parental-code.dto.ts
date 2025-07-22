import { IsString, Length } from 'class-validator';

export class SetParentalCodeDto {
  @IsString()
  @Length(4, 4)
  parentalCode: string;
}