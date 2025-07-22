import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type StudySessionDocument = StudySession & Document;

export enum BreakType {
  STRETCH = 'STRETCH',
  WATER = 'WATER',
  RESTROOM = 'RESTROOM',
  FORCED = 'FORCED',
}

@Schema({ _id: false })
export class FocusEntry {
  @Prop({ required: true })
  timestamp: number;

  @Prop({ required: true })
  isFocused: boolean;

  @Prop({ required: true })
  isOnSeat: boolean;
}

export const FocusEntrySchema = SchemaFactory.createForClass(FocusEntry);

@Schema({ _id: false })
export class BreakEntry {
  @Prop({ required: true })
  startTime: number;

  @Prop({ required: true })
  endTime: number;

  @Prop({ type: String, enum: BreakType, required: true })
  type: BreakType;
}

export const BreakEntrySchema = SchemaFactory.createForClass(BreakEntry);

@Schema({ timestamps: true })
export class StudySession {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  startTime: number;

  @Prop()
  endTime: number;

  @Prop({ type: [FocusEntrySchema], default: [] })
  focusHistory: FocusEntry[];

  @Prop({ type: [BreakEntrySchema], default: [] })
  breakHistory: BreakEntry[];

  @Prop({ default: 0 })
  totalTokensUsed: number;
}

export const StudySessionSchema = SchemaFactory.createForClass(StudySession);