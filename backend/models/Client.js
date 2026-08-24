import mongoose from 'mongoose';
import toJSON from '../utils/toJSON.js';

const clientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    number: {
      type: String,
      trim: true,
      default: '',
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    age: {
      type: Number,
      min: [0, 'Age cannot be negative'],
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Unknown'],
    },
    concern: {
      type: String,
      trim: true,
      default: '',
    },
    nextVisit: {
      type: Date,
    },
    treatmentPlan: {
      type: String,
      trim: true,
      default: '',
    },
    treatmentHistory: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { timestamps: true }
);

clientSchema.index({ name: 'text', concern: 'text', number: 'text' });
clientSchema.index(
  { number: 1 },
  { unique: true, partialFilterExpression: { number: { $type: 'string', $ne: '' } } }
);
clientSchema.plugin(toJSON);

export default mongoose.model('Client', clientSchema);
