import mongoose, { Schema, Document } from 'mongoose';

export interface ITrip extends Document {
  createdBy: string;
  destination: string;
  description: string;
  startDate: Date;
  endDate: Date;
  duration: string;
  category: string; // temple, foreign, trekking, nature
  travelers: string[];
  createdAt: Date;
  updatedAt: Date;
}

const TripSchema: Schema = new Schema(
  {
    createdBy: {
      type: String,
      required: true,
      index: true,
    },
    destination: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    duration: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['temple', 'foreign', 'trekking', 'nature'],
      default: 'nature',
    },
    travelers: [{
      type: String,
    }],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ITrip>('Trip', TripSchema);

