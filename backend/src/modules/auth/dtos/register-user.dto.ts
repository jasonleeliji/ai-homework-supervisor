// 文件路径: backend/src/modules/auth/dtos/register-user.dto.ts

import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class RegisterUserDto {
  @IsString({ message: '手机号必须是字符串' })
  @IsNotEmpty({ message: '手机号不能为空' })
  @Length(11, 11, { message: '手机号必须是11位' })
  @Matches(/^1[3-9]\d{9}$/, { message: '请输入有效的中国大陆手机号' })
  phone: string;

  // 根据PRD，我们使用短信验证码注册，密码（授权码）是后续设置的。
  // 因此，在基础注册DTO中，我们暂时不需要密码字段。
  // 如果未来需要密码注册，可以取消下面的注释。
  /*
  @IsString({ message: '密码必须是字符串' })
  @IsNotEmpty({ message: '密码不能为空' })
  @Length(4, 4, { message: '授权码必须是4位数字' })
  password: string;
  */

  // 短信验证码字段，暂时我们先不处理短信验证逻辑，只定义字段
  @IsString({ message: '验证码必须是字符串' })
  @IsNotEmpty({ message: '验证码不能为空' })
  @Length(6, 6, { message: '验证码必须是6位' })
  code: string;
}