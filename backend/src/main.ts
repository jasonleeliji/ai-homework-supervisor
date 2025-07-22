import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // 启用CORS
  app.enableCors({
    origin: 'http://localhost:5173', // 前端地址
    credentials: true,
  });
  
  // 启用全局验证管道
  app.useGlobalPipes(new ValidationPipe());
  
  // 固定端口3000
  await app.listen(3000);
  console.log('Backend server is running on http://localhost:3000');
}
bootstrap();
