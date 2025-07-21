import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    // 业务逻辑待实现
    return 'Hello World!';
  }
}