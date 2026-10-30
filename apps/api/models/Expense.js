import mongoose from 'mongoose';
import toJSON from '../utils/toJSON.js';
import { CITY_OPTIONS, EXPENSE_CATEGORY_OPTIONS, EXPENSE_STATUS_OPTIONS } from '@daesthetics/shared';

const expenseSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: EXPENSE_CATEGORY_OPTIONS,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      enum: CITY_OPTIONS,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: EXPENSE_STATUS_OPTIONS,
      default: 'Pending',
    },
    submittedBy: {
      type: String,
      required: [true, 'Submitted by is required'],
      trim: true,
    },
  },
  { timestamps: true }
);

expenseSchema.plugin(toJSON);

export default mongoose.model('Expense', expenseSchema);
