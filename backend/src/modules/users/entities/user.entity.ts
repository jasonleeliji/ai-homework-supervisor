// 文件路径: backend/src/modules/users/entities/user.entity.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

// 定义订阅计划的类型，可以是 'standard' 或 'professional'
export type SubscriptionPlan = 'standard' | 'professional';

// 定义学习规则的嵌套结构
@Schema({ _id: false }) // _id: false 表示这个嵌套对象本身不创建独立的_id
export class StudyRules {
  @Prop({ default: 45 })
  forcedRestTriggerMinutes: number; // 强制休息触发时长（分钟）

  @Prop({ default: 10 })
  forcedRestDurationMinutes: number; // 强制休息时长（分钟）

  @Prop({ default: 3 })
  activeRestDurationMinutes: number; // 主动休息时长（分钟）

  @Prop({ default: 2 })
  activeRestLimitPerHour: number; // 每小时主动休息次数上限
}

@Schema({ timestamps: true }) // timestamps: true 会自动添加 createdAt 和 updatedAt 字段
export class User extends Document {
  // 我们使用 MongoDB 自动生成的 _id 作为主键，所以这里不用显式定义

  @Prop({ type: String, required: true, unique: true, index: true })
  phone: string; // 11位手机号，唯一且建立索引以加快查询

  @Prop({ type: String, required: false }) // 密码/授权码，初始注册时可以没有
  password?: string; // 我们统一叫password，但它实际存储的是4位授权码的哈希值

  @Prop({ type: String, required: false })
  nickname?: string; // 孩子昵称

  @Prop({ type: String, enum: ['male', 'female', 'secret'], required: false })
  gender?: 'male' | 'female' | 'secret'; // 性别

  @Prop({ type: Number, required: false })
  grade?: number; // 年级

  @Prop({ type: String, default: 'standard', enum: ['standard', 'professional'] })
  subscriptionPlan: SubscriptionPlan; // 订阅计划

  @Prop({ type: Date, required: false })
  subscriptionExpiresAt?: Date; // 订阅到期时间

  @Prop({ type: Boolean, default: true })
  isTrialing: boolean; // 是否处于试用期

  @Prop({ type: StudyRules, default: () => ({}) }) // 使用一个返回空对象的函数作为默认值
  studyRules: StudyRules; // 学习规则设置

  // `timestamps: true` 已经帮我们做了下面的事情:
  // @Prop()
  // createdAt: Date;
  // @Prop()
  // updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// 为了防止密码（授权码哈希）在查询用户时被意外返回，我们默认隐藏它
UserSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};