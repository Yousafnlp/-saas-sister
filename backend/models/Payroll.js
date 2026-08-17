import mongoose from 'mongoose';
import toJSON from '../utils/toJSON.js';

const payrollSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Employee is required'],
    },
    employeeName: {
      type: String,
      required: [true, 'Employee name is required'],
      trim: true,
    },
    employeeEmail: {
      type: String,
      required: [true, 'Employee email is required'],
      lowercase: true,
      trim: true,
    },
    month: {
      type: String,
      required: [true, 'Month is required'],
      trim: true,
    },
    baseSalary: {
      type: Number,
      required: [true, 'Base salary is required'],
      min: [0, 'Base salary cannot be negative'],
    },
    bonus: {
      type: Number,
      default: 0,
      min: [0, 'Bonus cannot be negative'],
    },
    deductions: {
      type: Number,
      default: 0,
      min: [0, 'Deductions cannot be negative'],
    },
    netSalary: {
      type: Number,
      min: [0, 'Net salary cannot be negative'],
    },
    status: {
      type: String,
      enum: ['Pending', 'Processed'],
      default: 'Pending',
    },
  },
  { timestamps: true }
);

payrollSchema.index({ employee: 1, month: 1 }, { unique: true });

payrollSchema.pre('validate', function computeNetSalary(next) {
  this.netSalary = (this.baseSalary || 0) + (this.bonus || 0) - (this.deductions || 0);
  next();
});

payrollSchema.plugin(toJSON);

export default mongoose.model('Payroll', payrollSchema);
