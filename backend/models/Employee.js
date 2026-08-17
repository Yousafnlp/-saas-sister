import mongoose from 'mongoose';
import toJSON from '../utils/toJSON.js';

const employeeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      enum: ['Doctor (DR)', 'Technician', 'Management'],
    },
    salary: {
      type: Number,
      required: [true, 'Salary is required'],
      min: [0, 'Salary cannot be negative'],
    },
    joinDate: {
      type: Date,
      required: [true, 'Join date is required'],
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },
    timings: {
      type: String,
      trim: true,
      default: '',
    },
    damages: {
      type: Number,
      default: 0,
      min: [0, 'Damages cannot be negative'],
    },
    benefits: {
      type: String,
      trim: true,
      default: '',
    },
    payrollReceiving: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { timestamps: true }
);

employeeSchema.index({ name: 'text', email: 'text' });
employeeSchema.plugin(toJSON);

export default mongoose.model('Employee', employeeSchema);
