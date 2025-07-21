import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() registerDto: any) {
    // 业务逻辑待实现
  }

  @Post('login')
  login(@Body() loginDto: any) {
    // 业务逻辑待实现
  }

  @Post('sms')
  sendSms(@Body() smsDto: any) {
    // 业务逻辑待实现
  }
}