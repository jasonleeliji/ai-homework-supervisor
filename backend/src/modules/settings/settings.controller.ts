import { Controller, Get, Put, Body } from '@nestjs/common';
import { SettingsService } from './settings.service';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  getSettings() {
    // 业务逻辑待实现
  }

  @Put('parental-control')
  updateParentalControlSettings(@Body() settingsDto: any) {
    // 业务逻辑待实现
  }
}