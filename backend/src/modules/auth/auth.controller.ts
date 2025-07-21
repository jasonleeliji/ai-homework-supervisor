// 文件路径: backend/src/modules/auth/auth.controller.ts

import { Controller, Post, Body, HttpCode, HttpStatus, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dtos/register-user.dto';

// @Controller('auth') 定义了这个控制器下所有路由的公共前缀，即 /auth
@Controller('auth')
export class AuthController {
  // 通过构造函数注入 AuthService
  constructor(private readonly authService: AuthService) {}

  /**
   * 用户注册接口
   * @param registerUserDto 包含用户注册信息的数据传输对象
   * @description 接收前端发送的 POST 请求到 /auth/register
   */
  @Post('register') // 定义一个处理 POST 请求到 /register 的路由
  @HttpCode(HttpStatus.CREATED) // 指定成功响应的 HTTP 状态码为 201 (Created)
  async register(
    @Body(new ValidationPipe()) registerUserDto: RegisterUserDto,
  ) {
    // 调用 AuthService 中的 register 方法来处理业务逻辑
    const user = await this.authService.register(registerUserDto);
    
    // NestJS 会自动将返回的 user 对象序列化为 JSON 并发送给客户端
    // 我们在 User 实体中定义的 toJSON 方法会确保密码哈希不会被返回
    return {
      statusCode: HttpStatus.CREATED,
      message: '用户注册成功',
      data: user,
    };
  }

  // 未来我们会在这里添加 /login, /send-sms-code 等路由
}