import { Controller, Post, Get, Put, Body, Param, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { SetParentalCodeDto } from './dto/set-parental-code.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { SubscribeDto } from './dto/subscribe.dto';
import { VerifyParentalCodeDto } from './dto/verify-parental-code.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body(new ValidationPipe()) createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Post('login')
  login(@Body(new ValidationPipe()) createUserDto: CreateUserDto) {
    return this.authService.login(createUserDto);
  }

  @Post(':userId/parental-code')
  setParentalCode(
    @Param('userId') userId: string,
    @Body(new ValidationPipe()) setParentalCodeDto: SetParentalCodeDto
  ) {
    return this.authService.setParentalCode(userId, setParentalCodeDto);
  }

  @Post(':userId/verify-parental-code')
  verifyParentalCode(
    @Param('userId') userId: string,
    @Body(new ValidationPipe()) verifyParentalCodeDto: VerifyParentalCodeDto
  ) {
    return this.authService.verifyParentalCode(userId, verifyParentalCodeDto);
  }

  @Put(':userId/profile')
  updateProfile(
    @Param('userId') userId: string,
    @Body(new ValidationPipe()) updateProfileDto: UpdateProfileDto
  ) {
    return this.authService.updateProfile(userId, updateProfileDto);
  }

  @Put(':userId/settings')
  updateSettings(
    @Param('userId') userId: string,
    @Body(new ValidationPipe()) updateSettingsDto: UpdateSettingsDto
  ) {
    return this.authService.updateSettings(userId, updateSettingsDto);
  }

  @Post(':userId/subscribe')
  subscribe(
    @Param('userId') userId: string,
    @Body(new ValidationPipe()) subscribeDto: SubscribeDto
  ) {
    return this.authService.subscribe(userId, subscribeDto);
  }

  @Get(':userId/status')
  getUserStatus(@Param('userId') userId: string) {
    return this.authService.getUserStatus(userId);
  }
}
