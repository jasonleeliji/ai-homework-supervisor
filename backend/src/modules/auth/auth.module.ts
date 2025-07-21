// 文件路径: backend/src/modules/auth/auth.module.ts

import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module'; // <-- 新增此行，导入 UsersModule

@Module({
  imports: [UsersModule], // <-- 新增此行，将 UsersModule 添加到 imports 数组
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}