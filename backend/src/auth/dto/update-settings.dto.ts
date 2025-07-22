import { IsNumber, IsBoolean, IsOptional, Min, Max } from 'class-validator';

export class UpdateSettingsDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(60)
  minSessionDuration?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  dailyTimeLimit?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  stretchBreak?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  waterBreak?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  restroomBreak?: number;

  @IsOptional()
  @IsNumber()
  @Min(5)
  @Max(20)
  forcedBreakDuration?: number;

  @IsOptional()
  @IsNumber()
  @Min(25)
  @Max(60)
  workDurationBeforeForcedBreak?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  waterBreakLimit?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  restroomBreakLimit?: number;

  @IsOptional()
  @IsBoolean()
  voiceRemindersEnabled?: boolean;
}