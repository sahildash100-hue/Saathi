import mongoose, { Schema, Document } from 'mongoose';

export interface IReminder extends Document {
  userId: string;
  text: string;
  timestamp: Date;
  scheduledTime?: Date;
  isVoiceCommand: boolean;
  audioFilePath?: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ReminderSchema: Schema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    text: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    scheduledTime: {
      type: Date,
    },
    isVoiceCommand: {
      type: Boolean,
      default: false,
    },
    audioFilePath: {
      type: String,
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IReminder>('Reminder', ReminderSchema);

