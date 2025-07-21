import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { SessionsService } from './sessions.service';

@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post()
  createSession(@Body() createDto: any) {
    // 业务逻辑待实现
  }

  @Get()
  getSessions() {
    // 业务逻辑待实现
  }

  @Get(':id/stats')
  getSessionStats(@Param('id') id: string) {
    // 业务逻辑待实现
  }
}