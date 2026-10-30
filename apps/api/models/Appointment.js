import mongoose from 'mongoose';
import toJSON from '../utils/toJSON.js';
import {
  APPOINTMENT_SERVICE_OPTIONS,
  APPOINTMENT_SOURCE_OPTIONS,
  APPOINTMENT_STATUS_OPTIONS,
} from '@daesthetics/shared';

const appointmentSchema = new mongoose.Schema(
  {
    lead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead',
      default: null,
    },
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
    service: {
      type: String,
      required: [true, 'Service is required'],
      enum: APPOINTMENT_SERVICE_OPTIONS,
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    time: {
      type: String,
      required: [true, 'Time is required'],
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Time must be in HH:mm format'],
    },
    status: {
      type: String,
      enum: APPOINTMENT_STATUS_OPTIONS,
      default: 'Scheduled',
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      default: null,
    },
    // The price-list service the client asked for (e.g. "HydraFacial Glow 6000"), if any.
    treatment: {
      type: String,
      trim: true,
      default: '',
    },
    source: {
      type: String,
      enum: APPOINTMENT_SOURCE_OPTIONS,
      default: 'Staff',
    },
    // Online bookings only. The unique indexes below make the database itself refuse a second
    // booking for the same seat in a slot, or for the same phone at a branch on one day, even when
    // two clients press "Confirm" at the same moment. Both are cleared when the booking is cancelled
    // or moved, which frees the seat.
    seatKey: {
      type: String,
      select: false,
    },
    dayKey: {
      type: String,
      select: false,
    },
  },
  { timestamps: true }
);

appointmentSchema.index({ date: 1, time: 1 });
appointmentSchema.index({ branch: 1, date: 1 });
appointmentSchema.index({ seatKey: 1 }, { unique: true, partialFilterExpression: { seatKey: { $type: 'string' } } });
appointmentSchema.index({ dayKey: 1 }, { unique: true, partialFilterExpression: { dayKey: { $type: 'string' } } });
appointmentSchema.plugin(toJSON);

export default mongoose.model('Appointment', appointmentSchema);
