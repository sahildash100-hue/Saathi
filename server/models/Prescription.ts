import mongoose, { Document, Schema } from 'mongoose';

export interface IPrescription extends Document {
  userId: string;
  medicationName: string;
  dosage: string;
  time: string; // Only time, not date
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PrescriptionSchema: Schema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    medicationName: {
      type: String,
      required: true,
    },
    dosage: {
      type: String,
      required: true,
    },
    time: {
      type: String,
      required: true,
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

export default mongoose.model<IPrescription>('Prescription', PrescriptionSchema);
