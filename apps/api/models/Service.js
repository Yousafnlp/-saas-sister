import mongoose from 'mongoose';
import toJSON from '../utils/toJSON.js';

const serviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    // 0 means "price on application": staff enter the price on the bill.
    price: {
      type: Number,
      default: 0,
      min: [0, 'Price cannot be negative'],
    },
    note: {
      type: String,
      trim: true,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    showOnline: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Case-insensitive, so "HydraFacial" and "hydrafacial" in the same category count as one service.
export const CASE_INSENSITIVE = { locale: 'en', strength: 2 };
serviceSchema.index({ category: 1, name: 1 }, { unique: true, collation: CASE_INSENSITIVE });
serviceSchema.plugin(toJSON);

export default mongoose.model('Service', serviceSchema);
