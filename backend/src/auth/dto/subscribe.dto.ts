import { IsEnum } from 'class-validator';
import { SubscriptionPlan } from '../schemas/user.schema';

export class SubscribeDto {
  @IsEnum(SubscriptionPlan)
  plan: SubscriptionPlan;
}