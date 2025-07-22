import { IsString, Length } from 'class-validator';

export class VerifyParentalCodeDto {
  @IsString()
  @Length(4, 4)
  parentalCode: string;
}