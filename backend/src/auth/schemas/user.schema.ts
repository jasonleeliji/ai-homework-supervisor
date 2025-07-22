import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

export enum SubscriptionPlan {
  NONE = 'none',
  STANDARD = 'standard',
  PRO = 'pro',
}

export enum Gender {
  BOY = 'boy',
  GIRL = 'girl',
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  phone: string;

  @Prop()
  parentalCode: string;

  @Prop({ type: String, enum: SubscriptionPlan, default: SubscriptionPlan.NONE })
  plan: SubscriptionPlan;

  @Prop()
  trialEndDate: Date;

  @Prop()
  subscriptionEndDate: Date;

  // 孩子档案
  @Prop({ default: '宝贝' })
  nickname: string;

  @Prop({ default: 8 })
  age: number;

  @Prop({ default: '小学二年级' })
  grade: string;

  @Prop({ type: String, enum: Gender, default: Gender.BOY })
  gender: Gender;

  // 学习设置
  @Prop({ default: 5 })
  minSessionDuration: number; // 分钟

  @Prop({ default: 3 })
  dailyTimeLimit: number; // 小时

  @Prop({ default: 5 })
  stretchBreak: number; // 分钟

  @Prop({ default: 2 })
  waterBreak: number; // 分钟

  @Prop({ default: 5 })
  restroomBreak: number; // 分钟

  @Prop({ default: 10 })
  forcedBreakDuration: number; // 分钟

  @Prop({ default: 45 })
  workDurationBeforeForcedBreak: number; // 分钟

  @Prop({ default: 4 })
  waterBreakLimit: number; // 每小时次数

  @Prop({ default: 2 })
  restroomBreakLimit: number; // 每小时次数

  @Prop({ default: true })
  voiceRemindersEnabled: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);