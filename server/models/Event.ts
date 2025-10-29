import mongoose, { Schema, Document } from 'mongoose';

export interface IEvent extends Document {
  createdBy: string;
  title: string;
  description: string;
  location: string;
  date: Date;
  time: string;
  attendees: string[];
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema: Schema = new Schema(
  {
    createdBy: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    location: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    attendees: [{
      type: String,
    }],
    category: {
      type: String,
      default: 'general',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IEvent>('Event', EventSchema);

