import { Controller, Post, Body, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('analyze-homework')
  @UseInterceptors(FileInterceptor('file'))
  analyzeHomework(@UploadedFile() file: Express.Multer.File, @Body() options: any) {
    // 业务逻辑待实现
  }
}