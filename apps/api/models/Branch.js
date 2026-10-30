import mongoose from 'mongoose';
import toJSON from '../utils/toJSON.js';
import { toMinutes } from '../utils/clinicTime.js';
import { BOOKING_SLOT_MINUTE_OPTIONS, WEEKDAY_OPTIONS } from '@daesthetics/shared';

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

const branchSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Booking link name is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Booking link name can only use letters, numbers and dashes'],
    },
    city: {
      type: String,
      trim: true,
      default: '',
    },
    address: {
      type: String,
      trim: true,
      default: '',
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    openingTime: {
      type: String,
      default: '10:00',
      match: [TIME_PATTERN, 'Opening time must be in HH:mm format'],
    },
    closingTime: {
      type: String,
      default: '20:00',
      match: [TIME_PATTERN, 'Closing time must be in HH:mm format'],
    },
    workingDays: {
      type: [{ type: String, enum: WEEKDAY_OPTIONS }],
      default: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      // Stored once each, in week order, whatever order or repeats were sent.
      set: (days) => (Array.isArray(days) ? WEEKDAY_OPTIONS.filter((day) => days.includes(day)) : days),
      validate: {
        validator: (days) => days.length > 0,
        message: 'Pick at least one day the branch is open',
      },
    },
    slotMinutes: {
      type: Number,
      enum: BOOKING_SLOT_MINUTE_OPTIONS,
      default: 30,
    },
    slotCapacity: {
      type: Number,
      min: [1, 'Bookings per slot must be at least 1'],
      default: 1,
    },
    bookingEnabled: {
      type: Boolean,
      default: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

branchSchema.pre('validate', function checkHours(next) {
  if (this.openingTime && this.closingTime) {
    const openMinutes = toMinutes(this.closingTime) - toMinutes(this.openingTime);
    if (openMinutes <= 0) {
      this.invalidate('closingTime', 'Closing time must be after opening time');
    } else if (openMinutes < this.slotMinutes) {
      this.invalidate('closingTime', `Opening hours must fit at least one ${this.slotMinutes}-minute slot`);
    }
  }
  next();
});

branchSchema.plugin(toJSON);

export default mongoose.model('Branch', branchSchema);
