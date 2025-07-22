import { IsString, IsNotEmpty } from 'class-validator';

export class AnalyzeImageDto {
  @IsString()
  @IsNotEmpty()
  imageBase64: string;
}