// 文件路径: backend/src/app.module.ts

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

// 导入所有功能模块
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { SessionsModule } from './modules/sessions/sessions.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { SettingsModule } from './modules/settings/settings.module';
import { AiModule } from './modules/ai/ai.module';

@Module({
  imports: [
    // 1. 配置模块，用于管理环境变量
    ConfigModule.forRoot({
      isGlobal: true, // 设置为全局模块，这样在任何地方都能访问环境变量
      envFilePath: '.env', // 指定环境变量文件的路径
    }),
    
    // 2. Mongoose 模块，用于连接 MongoDB
    MongooseModule.forRootAsync({
      imports: [ConfigModule], // 依赖 ConfigModule
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'), // 从环境变量读取数据库连接字符串
      }),
      inject: [ConfigService], // 注入 ConfigService
    }),

    // 3. 导入我们所有的业务模块
    AuthModule,
    UsersModule,
    SessionsModule,
    SubscriptionsModule,
    SettingsModule,
    AiModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}