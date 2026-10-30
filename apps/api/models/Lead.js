import mongoose from 'mongoose';
import toJSON from '../utils/toJSON.js';
import { CITY_OPTIONS, GENDER_OPTIONS, LEAD_CATEGORY_OPTIONS, LEAD_SOURCE_OPTIONS } from '@daesthetics/shared';

const leadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    number: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    source: {
      type: String,
      required: [true, 'Source is required'],
      enum: LEAD_SOURCE_OPTIONS,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      enum: CITY_OPTIONS,
    },
    gender: {
      type: String,
      required: [true, 'Gender is required'],
      enum: GENDER_OPTIONS,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: LEAD_CATEGORY_OPTIONS,
    },
  },
  { timestamps: true }
);

leadSchema.index({ name: 'text', number: 'text' });
leadSchema.plugin(toJSON);

export default mongoose.model('Lead', leadSchema);
