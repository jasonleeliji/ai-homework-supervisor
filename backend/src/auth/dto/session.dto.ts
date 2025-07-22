import { IsEnum, IsNumber, IsOptional } from 'class-validator';
import { BreakType } from '../schemas/study-session.schema';

export class StartSessionDto {
  // 可以为空，系统自动生成
}

export class EndSessionDto {
  @IsNumber()
  endTime: number;
}

export class AddFocusEntryDto {
  @IsNumber()
  timestamp: number;

  @IsNumber()
  isFocused: boolean;

  @IsNumber()
  isOnSeat: boolean;
}

export class AddBreakEntryDto {
  @IsNumber()
  startTime: number;

  @IsNumber()
  endTime: number;

  @IsEnum(BreakType)
  type: BreakType;
}