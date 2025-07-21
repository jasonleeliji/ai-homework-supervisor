import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  getProfile() {
    // 业务逻辑待实现
  }

  @Put('profile')
  updateProfile(@Body() updateDto: any) {
    // 业务逻辑待实现
  }
}