import mongoose from 'mongoose';
import toJSON from '../utils/toJSON.js';
import { nextSequence } from './Counter.js';
import { BILLING_PAYMENT_METHOD_OPTIONS, BILLING_PAYMENT_STATUS_OPTIONS } from '@daesthetics/shared';

const billItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
    },
    category: {
      type: String,
      trim: true,
      default: '',
    },
    price: {
      type: Number,
      required: [true, 'Item price is required'],
      min: [0, 'Item price cannot be negative'],
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1'],
      default: 1,
    },
    lineTotal: {
      type: Number,
      min: [0, 'Line total cannot be negative'],
    },
  },
  { _id: false }
);

const billSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      unique: true,
    },
    clientName: {
      type: String,
      required: [true, 'Client name is required'],
      trim: true,
    },
    clientNumber: {
      type: String,
      required: [true, 'Client number is required'],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    items: {
      type: [billItemSchema],
      validate: {
        validator: (items) => Array.isArray(items) && items.length > 0,
        message: 'At least one service item is required',
      },
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, 'Discount cannot be negative'],
    },
    subtotal: {
      type: Number,
      min: [0, 'Subtotal cannot be negative'],
    },
    total: {
      type: Number,
      min: [0, 'Total cannot be negative'],
    },
    paymentMethod: {
      type: String,
      enum: BILLING_PAYMENT_METHOD_OPTIONS,
      default: 'Cash',
    },
    paymentStatus: {
      type: String,
      enum: BILLING_PAYMENT_STATUS_OPTIONS,
      default: 'Paid',
    },
    amountPaid: {
      type: Number,
      default: 0,
      min: [0, 'Amount paid cannot be negative'],
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { timestamps: true }
);

billSchema.index({ clientName: 'text', clientNumber: 'text' });

billSchema.pre('validate', async function computeBillTotals(next) {
  this.items.forEach((item) => {
    item.lineTotal = Math.round((item.price || 0) * (item.quantity || 1) * 100) / 100;
  });

  const subtotal = this.items.reduce((sum, item) => sum + item.lineTotal, 0);
  this.subtotal = subtotal;
  this.total = Math.max(subtotal - (this.discount || 0), 0);

  if (this.paymentStatus === 'Paid') {
    this.amountPaid = this.total;
  } else if (this.amountPaid > this.total) {
    this.amountPaid = this.total;
  }

  if (this.isNew && !this.invoiceNumber) {
    const year = new Date(this.date || Date.now()).getFullYear();
    const seq = await nextSequence(`bill-${year}`);
    this.invoiceNumber = `INV-${year}-${String(seq).padStart(5, '0')}`;
  }

  next();
});

billSchema.plugin(toJSON);

export default mongoose.model('Bill', billSchema);
