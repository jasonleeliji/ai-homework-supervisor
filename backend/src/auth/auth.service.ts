import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';
import { StudySession, StudySessionDocument } from './schemas/study-session.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { SetParentalCodeDto } from './dto/set-parental-code.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { SubscribeDto } from './dto/subscribe.dto';
import { VerifyParentalCodeDto } from './dto/verify-parental-code.dto';
import { StartSessionDto, EndSessionDto, AddFocusEntryDto, AddBreakEntryDto } from './dto/session.dto';
import { AnalyzeImageDto } from './dto/analyze-image.dto';

enum SubscriptionPlan {
  NONE = 'none',
  STANDARD = 'standard',
  PRO = 'pro',
}

enum BreakType {
  STRETCH = 'stretch',
  WATER = 'water',
  RESTROOM = 'restroom',
  FORCED = 'forced',
}

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(StudySession.name) private studySessionModel: Model<StudySessionDocument>,
  ) {}

  async register(createUserDto: CreateUserDto) {
    const { phone, code } = createUserDto;
    
    // 开发环境使用固定验证码
    if (code !== '123456') {
      throw new HttpException('验证码错误', HttpStatus.BAD_REQUEST);
    }

    const existingUser = await this.userModel.findOne({ phone });
    if (existingUser) {
      throw new HttpException('该手机号已注册', HttpStatus.CONFLICT);
    }

    // 创建新用户，自动给5天试用期
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 5);

    const createdUser = new this.userModel({ 
      phone,
      trialEndDate,
    });
    
    const savedUser = await createdUser.save();
    return {
      message: '注册成功',
      user: {
        id: savedUser._id,
        phone: savedUser.phone,
        plan: savedUser.plan,
        trialEndDate: savedUser.trialEndDate,
        hasParentalCode: !!savedUser.parentalCode,
      }
    };
  }

  async login(createUserDto: CreateUserDto) {
    const { phone, code } = createUserDto;
    
    // 开发环境使用固定验证码
    if (code !== '123456') {
      throw new HttpException('验证码错误', HttpStatus.BAD_REQUEST);
    }

    const user = await this.userModel.findOne({ phone });
    if (!user) {
      throw new HttpException('用户不存在', HttpStatus.NOT_FOUND);
    }

    return {
      message: '登录成功',
      user: {
        id: user._id,
        phone: user.phone,
        plan: user.plan,
        trialEndDate: user.trialEndDate,
        subscriptionEndDate: user.subscriptionEndDate,
        hasParentalCode: !!user.parentalCode,
        profile: {
          nickname: user.nickname,
          age: user.age,
          grade: user.grade,
          gender: user.gender,
        },
        settings: {
          minSessionDuration: user.minSessionDuration,
          dailyTimeLimit: user.dailyTimeLimit,
          stretchBreak: user.stretchBreak,
          waterBreak: user.waterBreak,
          restroomBreak: user.restroomBreak,
          forcedBreakDuration: user.forcedBreakDuration,
          workDurationBeforeForcedBreak: user.workDurationBeforeForcedBreak,
          waterBreakLimit: user.waterBreakLimit,
          restroomBreakLimit: user.restroomBreakLimit,
          voiceRemindersEnabled: user.voiceRemindersEnabled,
        }
      }
    };
  }

  async setParentalCode(userId: string, setParentalCodeDto: SetParentalCodeDto) {
    const { parentalCode } = setParentalCodeDto;
    
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new HttpException('用户不存在', HttpStatus.NOT_FOUND);
    }

    // 加密存储家长授权码
    const hashedCode = await bcrypt.hash(parentalCode, 10);
    user.parentalCode = hashedCode;
    await user.save();

    return { message: '家长授权码设置成功' };
  }

  async verifyParentalCode(userId: string, verifyParentalCodeDto: VerifyParentalCodeDto) {
    const { parentalCode } = verifyParentalCodeDto;
    
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new HttpException('用户不存在', HttpStatus.NOT_FOUND);
    }

    if (!user.parentalCode) {
      throw new HttpException('未设置家长授权码', HttpStatus.BAD_REQUEST);
    }

    const isValid = await bcrypt.compare(parentalCode, user.parentalCode);
    if (!isValid) {
      throw new HttpException('家长授权码错误', HttpStatus.UNAUTHORIZED);
    }

    return { message: '验证成功', valid: true };
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new HttpException('用户不存在', HttpStatus.NOT_FOUND);
    }

    Object.assign(user, updateProfileDto);
    await user.save();

    return {
      message: '档案更新成功',
      profile: {
        nickname: user.nickname,
        age: user.age,
        grade: user.grade,
        gender: user.gender,
      }
    };
  }

  async updateSettings(userId: string, updateSettingsDto: UpdateSettingsDto) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new HttpException('用户不存在', HttpStatus.NOT_FOUND);
    }

    Object.assign(user, updateSettingsDto);
    await user.save();

    return {
      message: '设置更新成功',
      settings: {
        minSessionDuration: user.minSessionDuration,
        dailyTimeLimit: user.dailyTimeLimit,
        stretchBreak: user.stretchBreak,
        waterBreak: user.waterBreak,
        restroomBreak: user.restroomBreak,
        forcedBreakDuration: user.forcedBreakDuration,
        workDurationBeforeForcedBreak: user.workDurationBeforeForcedBreak,
        waterBreakLimit: user.waterBreakLimit,
        restroomBreakLimit: user.restroomBreakLimit,
        voiceRemindersEnabled: user.voiceRemindersEnabled,
      }
    };
  }

  async subscribe(userId: string, subscribeDto: SubscribeDto) {
    const { plan } = subscribeDto;
    
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new HttpException('用户不存在', HttpStatus.NOT_FOUND);
    }

    if (plan === SubscriptionPlan.NONE) {
      throw new HttpException('无效的订阅计划', HttpStatus.BAD_REQUEST);
    }

    // 模拟支付成功，设置订阅到期时间为一个月后
    const subscriptionEndDate = new Date();
    subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1);

    user.plan = plan;
    user.subscriptionEndDate = subscriptionEndDate;
    await user.save();

    return {
      message: '订阅成功',
      subscription: {
        plan: user.plan,
        subscriptionEndDate: user.subscriptionEndDate,
      }
    };
  }

  async getUserStatus(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new HttpException('用户不存在', HttpStatus.NOT_FOUND);
    }

    const now = new Date();
    const isTrialActive = user.trialEndDate && user.trialEndDate > now;
    const hasActiveSubscription = user.subscriptionEndDate && user.subscriptionEndDate > now;

    // 计算今日学习时间
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    const todaySessions = await this.studySessionModel.find({
      userId: user._id,
      startTime: { $gte: todayStart.getTime() },
      endTime: { $exists: true, $ne: null }
    });

    const todayStudyTime = todaySessions.reduce((total, session) => {
      return total + (session.endTime - session.startTime);
    }, 0) / 1000; // 转换为秒

    // 确定有效的每日限制
    let effectiveDailyLimit = 0;
    let planName = '未订阅';

    if (hasActiveSubscription) {
      if (user.plan === SubscriptionPlan.STANDARD) {
        effectiveDailyLimit = 3;
        planName = '标准版';
      } else if (user.plan === SubscriptionPlan.PRO) {
        effectiveDailyLimit = 5;
        planName = '专业版';
      }
    } else if (isTrialActive) {
      effectiveDailyLimit = 3;
      planName = '免费体验版';
    }

    return {
      user: {
        id: user._id,
        phone: user.phone,
        plan: user.plan,
        planName,
        trialEndDate: user.trialEndDate,
        subscriptionEndDate: user.subscriptionEndDate,
        isTrialActive,
        hasActiveSubscription,
        effectiveDailyLimit,
        hasParentalCode: !!user.parentalCode,
        profile: {
          nickname: user.nickname,
          age: user.age,
          grade: user.grade,
          gender: user.gender,
        },
        settings: {
          minSessionDuration: user.minSessionDuration,
          dailyTimeLimit: user.dailyTimeLimit,
          stretchBreak: user.stretchBreak,
          waterBreak: user.waterBreak,
          restroomBreak: user.restroomBreak,
          forcedBreakDuration: user.forcedBreakDuration,
          workDurationBeforeForcedBreak: user.workDurationBeforeForcedBreak,
          waterBreakLimit: user.waterBreakLimit,
          restroomBreakLimit: user.restroomBreakLimit,
          voiceRemindersEnabled: user.voiceRemindersEnabled,
        }
      },
      todayStudyTime: todayStudyTime / 3600, // 转换为小时
    };
  }

  // 学习会话管理方法
  async startSession(userId: string, startSessionDto: StartSessionDto) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new HttpException('用户不存在', HttpStatus.NOT_FOUND);
    }

    // 检查是否有正在进行的会话
    const existingSession = await this.studySessionModel.findOne({
      userId: user._id,
      endTime: null
    });

    if (existingSession) {
      throw new HttpException('已有正在进行的学习会话', HttpStatus.BAD_REQUEST);
    }

    const session = new this.studySessionModel({
      userId: user._id,
      startTime: Date.now(),
      focusHistory: [],
      breakHistory: [],
      totalTokensUsed: 0,
    });

    await session.save();

    return {
      message: '学习会话开始',
      sessionId: session._id,
      startTime: session.startTime,
    };
  }

  async endSession(userId: string, endSessionDto: EndSessionDto) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new HttpException('用户不存在', HttpStatus.NOT_FOUND);
    }

    const session = await this.studySessionModel.findOne({
      userId: user._id,
      endTime: null
    });

    if (!session) {
      throw new HttpException('没有正在进行的学习会话', HttpStatus.NOT_FOUND);
    }

    session.endTime = Date.now();
    await session.save();

    // 计算会话统计
    const duration = session.endTime - session.startTime;
    const focusedTime = session.focusHistory.filter(entry => entry.isFocused).length * 30; // 假设每30秒一次检测
    const focusRate = session.focusHistory.length > 0 ? (focusedTime / session.focusHistory.length) : 0;

    return {
      message: '学习会话结束',
      sessionId: session._id,
      duration: duration / 1000, // 转换为秒
      focusRate,
      tokenUsage: session.totalTokensUsed,
    };
  }

  async addFocusEntry(userId: string, addFocusEntryDto: AddFocusEntryDto) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new HttpException('用户不存在', HttpStatus.NOT_FOUND);
    }

    const session = await this.studySessionModel.findOne({
      userId: user._id,
      endTime: null
    });

    if (!session) {
      throw new HttpException('没有正在进行的学习会话', HttpStatus.NOT_FOUND);
    }

    session.focusHistory.push({
      timestamp: addFocusEntryDto.timestamp,
      isFocused: addFocusEntryDto.isFocused,
      isOnSeat: addFocusEntryDto.isOnSeat,
    });

    await session.save();

    return {
      message: '专注记录已添加',
      entry: {
        timestamp: addFocusEntryDto.timestamp,
        isFocused: addFocusEntryDto.isFocused,
        isOnSeat: addFocusEntryDto.isOnSeat,
      }
    };
  }

  async addBreakEntry(userId: string, addBreakEntryDto: AddBreakEntryDto) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new HttpException('用户不存在', HttpStatus.NOT_FOUND);
    }

    const session = await this.studySessionModel.findOne({
      userId: user._id,
      endTime: null
    });

    if (!session) {
      throw new HttpException('没有正在进行的学习会话', HttpStatus.NOT_FOUND);
    }

    session.breakHistory.push({
      startTime: addBreakEntryDto.startTime,
      endTime: addBreakEntryDto.endTime,
      type: addBreakEntryDto.type,
    });

    await session.save();

    return {
      message: '休息记录已添加',
      entry: {
        startTime: addBreakEntryDto.startTime,
        endTime: addBreakEntryDto.endTime,
        type: addBreakEntryDto.type,
      }
    };
  }

  async analyzeImage(userId: string, analyzeImageDto: AnalyzeImageDto) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new HttpException('用户不存在', HttpStatus.NOT_FOUND);
    }

    const session = await this.studySessionModel.findOne({
      userId: user._id,
      endTime: null
    });

    if (!session) {
      throw new HttpException('没有正在进行的学习会话', HttpStatus.NOT_FOUND);
    }

    // 模拟AI分析结果（随机生成，实际项目中应该调用真实的AI服务）
    const analysisResult = {
      isOnSeat: Math.random() > 0.2, // 80%概率在座位上
      isFocused: Math.random() > 0.3, // 70%概率专注
      reminder: null as string | null
    };

    // 如果不专注或不在座位上，生成提醒
    if (!analysisResult.isFocused || !analysisResult.isOnSeat) {
      const reminders = [
        `${user.nickname || '小朋友'}，专心学习哦！`,
        `${user.nickname || '小朋友'}，回到座位上继续学习吧！`,
        `${user.nickname || '小朋友'}，集中注意力，你可以的！`,
        `${user.nickname || '小朋友'}，坐好了，认真学习！`
      ];
      analysisResult.reminder = reminders[Math.floor(Math.random() * reminders.length)];
    }

    // 更新token使用量
    session.totalTokensUsed += 1;
    await session.save();

    // 添加专注记录
    await this.addFocusEntry(userId, {
      timestamp: Date.now(),
      isFocused: analysisResult.isFocused,
      isOnSeat: analysisResult.isOnSeat,
    });

    return {
      message: '图片分析完成',
      analysis: {
        isOnSeat: analysisResult.isOnSeat,
        isFocused: analysisResult.isFocused,
        reminder: analysisResult.reminder,
        tokenUsed: 1,
        totalTokenUsage: session.totalTokensUsed,
      }
    };
  }

  async getCurrentSession(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new HttpException('用户不存在', HttpStatus.NOT_FOUND);
    }

    const session = await this.studySessionModel.findOne({
      userId: user._id,
      endTime: null
    });

    if (!session) {
      return { message: '没有正在进行的学习会话', session: null };
    }

    return {
      message: '当前学习会话',
      session: {
        id: session._id,
        startTime: session.startTime,
        duration: Date.now() - session.startTime,
        focusHistory: session.focusHistory,
        breakHistory: session.breakHistory,
        tokenUsage: session.totalTokensUsed,
      }
    };
  }

  async getSessionHistory(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new HttpException('用户不存在', HttpStatus.NOT_FOUND);
    }

    const sessions = await this.studySessionModel.find({
      userId: user._id,
      endTime: { $exists: true, $ne: null }
    }).sort({ startTime: -1 }).limit(30);

    return {
      message: '学习会话历史',
      sessions: sessions.map(session => ({
        id: session._id,
        startTime: session.startTime,
        endTime: session.endTime,
        duration: session.endTime - session.startTime,
        focusHistory: session.focusHistory,
        breakHistory: session.breakHistory,
        tokenUsage: session.totalTokensUsed,
      }))
    };
  }

  async getReport(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new HttpException('用户不存在', HttpStatus.NOT_FOUND);
    }

    // 获取最近7天的数据
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const sessions = await this.studySessionModel.find({
      userId: user._id,
      startTime: { $gte: sevenDaysAgo.getTime() },
      endTime: { $exists: true, $ne: null }
    });

    // 计算统计数据
    const totalStudyTime = sessions.reduce((total, session) => {
      return total + (session.endTime - session.startTime);
    }, 0) / 1000 / 3600; // 转换为小时

    const totalFocusEntries = sessions.reduce((total, session) => {
      return total + session.focusHistory.length;
    }, 0);

    const focusedEntries = sessions.reduce((total, session) => {
      return total + session.focusHistory.filter(entry => entry.isFocused).length;
    }, 0);

    const focusRate = totalFocusEntries > 0 ? (focusedEntries / totalFocusEntries) * 100 : 0;

    const totalBreaks = sessions.reduce((total, session) => {
      return total + session.breakHistory.length;
    }, 0);

    const totalTokenUsage = sessions.reduce((total, session) => {
      return total + session.totalTokensUsed;
    }, 0);

    // 按天分组数据
    const dailyData = {};
    sessions.forEach(session => {
      const date = new Date(session.startTime).toDateString();
      if (!dailyData[date]) {
        dailyData[date] = {
          studyTime: 0,
          focusRate: 0,
          breaks: 0,
          sessions: 0,
        };
      }
      dailyData[date].studyTime += (session.endTime - session.startTime) / 1000 / 3600;
      dailyData[date].breaks += session.breakHistory.length;
      dailyData[date].sessions += 1;
      
      const sessionFocusEntries = session.focusHistory.length;
      const sessionFocusedEntries = session.focusHistory.filter(entry => entry.isFocused).length;
      if (sessionFocusEntries > 0) {
        dailyData[date].focusRate = (sessionFocusedEntries / sessionFocusEntries) * 100;
      }
    });

    return {
      message: '学习报告',
      report: {
        period: '最近7天',
        summary: {
          totalStudyTime: Math.round(totalStudyTime * 100) / 100,
          averageFocusRate: Math.round(focusRate * 100) / 100,
          totalSessions: sessions.length,
          totalBreaks,
          totalTokenUsage,
        },
        dailyData: Object.keys(dailyData).map(date => ({
          date,
          ...dailyData[date],
          studyTime: Math.round(dailyData[date].studyTime * 100) / 100,
          focusRate: Math.round(dailyData[date].focusRate * 100) / 100,
        }))
      }
    };
  }
}
