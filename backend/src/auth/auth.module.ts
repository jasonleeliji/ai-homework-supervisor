import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthController } from './auth.controller';
import { SessionController } from './session.controller';
import { AuthService } from './auth.service';
import { User, UserSchema } from './schemas/user.schema';
import { StudySession, StudySessionSchema } from './schemas/study-session.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: StudySession.name, schema: StudySessionSchema },
    ])
  ],
  controllers: [AuthController, SessionController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
