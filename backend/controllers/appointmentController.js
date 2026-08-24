import Appointment from '../models/Appointment.js';
import Client from '../models/Client.js';
import Lead from '../models/Lead.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import { getAll, getOne, createOne, deleteOne } from '../utils/handlerFactory.js';

const searchFields = ['name', 'number'];

export const getAppointments = getAll(Appointment, { searchFields });
export const getAppointment = getOne(Appointment, { populate: 'lead' });
export const createAppointment = createOne(Appointment);

export const updateAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) {
    throw new AppError(`Appointment not found with id ${req.params.id}`, 404);
  }

  const wasCompleted = appointment.status === 'Completed';
  Object.assign(appointment, req.body);
  await appointment.save();

  if (appointment.status === 'Completed' && !wasCompleted) {
    const existingClient = await Client.findOne({ number: appointment.number });
    if (!existingClient) {
      await Client.create({
        name: appointment.name,
        number: appointment.number,
        date: appointment.date,
        concern: appointment.service,
      });
    }

    if (appointment.lead) {
      await Lead.findByIdAndUpdate(appointment.lead, { category: 'Clients' });
    }
  }

  res.status(200).json({ success: true, data: appointment });
});

export const deleteAppointment = deleteOne(Appointment);
