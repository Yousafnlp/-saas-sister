import mongoose from 'mongoose';
import toJSON from '../utils/toJSON.js';

const expenseSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['Travel', 'Meals', 'Office Supplies', 'Equipment', 'Software', 'Other'],
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
      enum: ['Pending', 'Approved', 'Rejected'],
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
