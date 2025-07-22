import { Controller, Post, Get, Put, Body, Param, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { StartSessionDto, EndSessionDto, AddFocusEntryDto, AddBreakEntryDto } from './dto/session.dto';
import { AnalyzeImageDto } from './dto/analyze-image.dto';

@Controller('session')
export class SessionController {
  constructor(private readonly authService: AuthService) {}

  @Post(':userId/start')
  startSession(
    @Param('userId') userId: string,
    @Body(new ValidationPipe()) startSessionDto: StartSessionDto
  ) {
    return this.authService.startSession(userId, startSessionDto);
  }

  @Post(':userId/end')
  endSession(
    @Param('userId') userId: string,
    @Body(new ValidationPipe()) endSessionDto: EndSessionDto
  ) {
    return this.authService.endSession(userId, endSessionDto);
  }

  @Post(':userId/focus')
  addFocusEntry(
    @Param('userId') userId: string,
    @Body(new ValidationPipe()) addFocusEntryDto: AddFocusEntryDto
  ) {
    return this.authService.addFocusEntry(userId, addFocusEntryDto);
  }

  @Post(':userId/break')
  addBreakEntry(
    @Param('userId') userId: string,
    @Body(new ValidationPipe()) addBreakEntryDto: AddBreakEntryDto
  ) {
    return this.authService.addBreakEntry(userId, addBreakEntryDto);
  }

  @Post(':userId/analyze')
  analyzeImage(
    @Param('userId') userId: string,
    @Body(new ValidationPipe()) analyzeImageDto: AnalyzeImageDto
  ) {
    return this.authService.analyzeImage(userId, analyzeImageDto);
  }

  @Get(':userId/current')
  getCurrentSession(@Param('userId') userId: string) {
    return this.authService.getCurrentSession(userId);
  }

  @Get(':userId/history')
  getSessionHistory(@Param('userId') userId: string) {
    return this.authService.getSessionHistory(userId);
  }

  @Get(':userId/report')
  getReport(@Param('userId') userId: string) {
    return this.authService.getReport(userId);
  }
}