import Appointment from '../models/Appointment.js';
import Client from '../models/Client.js';
import Lead from '../models/Lead.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import { getAll, getOne, deleteOne } from '../utils/handlerFactory.js';

const searchFields = ['name', 'number'];
const branchPopulate = { path: 'branch', select: 'name slug' };

const MAX_CALENDAR_DAYS = 62;
const DAY_MS = 24 * 60 * 60 * 1000;

export const getAppointments = getAll(Appointment, { searchFields, populate: branchPopulate });
export const getAppointment = getOne(Appointment, { populate: 'lead' });

export const createAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.create({ ...req.body, source: 'Staff' });
  await appointment.populate(branchPopulate);
  res.status(201).json({ success: true, data: appointment });
});

// Every appointment between two dates (inclusive), unpaginated, for the calendar view.
export const getCalendarAppointments = asyncHandler(async (req, res) => {
  const from = new Date(`${req.query.from}T00:00:00.000Z`);
  const to = new Date(`${req.query.to}T00:00:00.000Z`);

  if (to < from) {
    throw new AppError("'to' must be on or after 'from'", 400);
  }
  if ((to - from) / DAY_MS > MAX_CALENDAR_DAYS) {
    throw new AppError(`Date range cannot be longer than ${MAX_CALENDAR_DAYS} days`, 400);
  }

  const filter = { date: { $gte: from, $lt: new Date(to.getTime() + DAY_MS) } };
  if (req.query.branch) filter.branch = req.query.branch;

  const data = await Appointment.find(filter).sort('date time').populate(branchPopulate).select('-__v');
  res.status(200).json({ success: true, count: data.length, data });
});

export const updateAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) {
    throw new AppError(`Appointment not found with id ${req.params.id}`, 404);
  }

  const wasCompleted = appointment.status === 'Completed';
  const { source, seatKey, dayKey, ...updates } = req.body;
  Object.assign(appointment, updates);

  // An online booking that is cancelled or moved gives its slot seat back.
  if (appointment.status === 'Cancelled' || appointment.isModified('date time branch number')) {
    appointment.seatKey = undefined;
    appointment.dayKey = undefined;
  }
  await appointment.save();

  if (appointment.status === 'Completed' && !wasCompleted) {
    const existingClient = await Client.findOne({ number: appointment.number });
    if (!existingClient) {
      await Client.create({
        name: appointment.name,
        number: appointment.number,
        date: appointment.date,
        concern: appointment.treatment || appointment.service,
      });
    }

    if (appointment.lead) {
      await Lead.findByIdAndUpdate(appointment.lead, { category: 'Clients' });
    }
  }

  await appointment.populate(branchPopulate);
  res.status(200).json({ success: true, data: appointment });
});

export const deleteAppointment = deleteOne(Appointment);
