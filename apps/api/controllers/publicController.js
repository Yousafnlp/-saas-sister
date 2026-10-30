import Appointment from '../models/Appointment.js';
import Branch from '../models/Branch.js';
import Service from '../models/Service.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import { addDays, buildSlots, clinicNow, dayRange, toMinutes, weekdayOf } from '../utils/clinicTime.js';
import { phoneKey } from '../utils/phone.js';

// Clients can book up to this many days ahead.
export const BOOKING_WINDOW_DAYS = 60;

const PUBLIC_BRANCH_FIELDS = 'name slug city address phone openingTime closingTime workingDays slotMinutes';

async function findBookableBranch(slug) {
  const branch = await Branch.findOne({ slug, isActive: true, bookingEnabled: true }).select(
    `${PUBLIC_BRANCH_FIELDS} slotCapacity`
  );
  if (!branch) {
    throw new AppError('This booking page does not exist or is not taking bookings right now.', 404);
  }
  return branch;
}

function publicBranch(branch) {
  const { slotCapacity, ...rest } = branch.toJSON();
  return rest;
}

async function getSlots(branch, date) {
  const today = clinicNow();
  const closed = { date, open: false, slots: [] };

  if (date < today.date || date > addDays(today.date, BOOKING_WINDOW_DAYS)) return closed;
  if (!branch.workingDays.includes(weekdayOf(date))) return closed;

  const booked = await Appointment.aggregate([
    { $match: { branch: branch._id, date: dayRange(date), status: { $ne: 'Cancelled' } } },
    { $group: { _id: '$time', count: { $sum: 1 } } },
  ]);
  const bookedByTime = new Map(booked.map((b) => [b._id, b.count]));

  const slots = buildSlots(branch).map((time) => ({
    time,
    available:
      (bookedByTime.get(time) || 0) < branch.slotCapacity && (date > today.date || toMinutes(time) > today.minutes),
  }));

  return { date, open: true, slots };
}

export const listBookableBranches = asyncHandler(async (req, res) => {
  const data = await Branch.find({ isActive: true, bookingEnabled: true }).select(PUBLIC_BRANCH_FIELDS).sort('name');
  res.status(200).json({ success: true, data });
});

export const getBookingPage = asyncHandler(async (req, res) => {
  const branch = await findBookableBranch(req.params.slug);
  const services = await Service.find({ isActive: true, showOnline: true })
    .select('name category price note')
    .sort('category name');

  res.status(200).json({
    success: true,
    data: {
      branch: publicBranch(branch),
      services,
      today: clinicNow().date,
      bookingWindowDays: BOOKING_WINDOW_DAYS,
    },
  });
});

export const getAvailability = asyncHandler(async (req, res) => {
  const branch = await findBookableBranch(req.params.slug);
  const data = await getSlots(branch, req.query.date);
  res.status(200).json({ success: true, data });
});

export const createBooking = asyncHandler(async (req, res) => {
  const branch = await findBookableBranch(req.params.slug);
  const { name, number, date, time, serviceId, notes = '' } = req.body;

  const { slots } = await getSlots(branch, date);
  if (!slots.some((slot) => slot.time === time && slot.available)) {
    throw new AppError('Sorry, that time is no longer available. Please pick another slot.', 409);
  }

  // Compare numbers by digits, so "0300-1234567" and "+92 300 1234567" are the same person.
  const clientKey = phoneKey(number);
  const alreadyBooked = () =>
    new AppError('You already have a booking at this branch on that day. Please contact us to change it.', 409);
  const sameDay = await Appointment.find({ branch: branch._id, date: dayRange(date), status: { $ne: 'Cancelled' } }).select('number');
  if (sameDay.some((existing) => phoneKey(existing.number) === clientKey)) throw alreadyBooked();

  let treatment = '';
  if (serviceId) {
    const service = await Service.findOne({ _id: serviceId, isActive: true, showOnline: true }).select('name');
    if (!service) throw new AppError('That service is not available for online booking.', 400);
    treatment = service.name;
  }

  // The checks above give clear messages; the unique seatKey/dayKey indexes are what actually stop
  // two simultaneous requests from both getting through. Appointments booked by staff (no seat) use
  // up capacity first, then each online booking claims the first free numbered seat.
  await Appointment.init();
  const unseated = await Appointment.countDocuments({
    branch: branch._id,
    date: dayRange(date),
    time,
    status: { $ne: 'Cancelled' },
    seatKey: { $exists: false },
  });

  let appointment = null;
  for (let seat = 0; seat < branch.slotCapacity - unseated && !appointment; seat += 1) {
    try {
      appointment = await Appointment.create({
        name,
        number,
        date,
        time,
        notes,
        treatment,
        service: 'Consultation',
        status: 'Scheduled',
        branch: branch._id,
        source: 'Online',
        seatKey: `${branch.id}|${date}|${time}|${seat}`,
        dayKey: `${branch.id}|${date}|${clientKey}`,
      });
    } catch (err) {
      if (err.code !== 11000) throw err;
      if (err.keyPattern?.dayKey) throw alreadyBooked();
      // That seat was taken a moment ago: try the next one.
    }
  }
  if (!appointment) {
    throw new AppError('Sorry, that time is no longer available. Please pick another slot.', 409);
  }

  res.status(201).json({
    success: true,
    data: {
      id: appointment.id,
      name: appointment.name,
      date,
      time,
      treatment,
      branch: publicBranch(branch),
    },
  });
});
