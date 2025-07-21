import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get('plans')
  getSubscriptionPlans() {
    // 业务逻辑待实现
  }

  @Post('subscribe')
  subscribeToPlan(@Body() subscribeDto: any) {
    // 业务逻辑待实现
  }

  @Get('status')
  getSubscriptionStatus() {
    // 业务逻辑待实现
  }
}