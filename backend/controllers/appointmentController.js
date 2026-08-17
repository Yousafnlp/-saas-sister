import Appointment from '../models/Appointment.js';
import { getAll, getOne, createOne, updateOne, deleteOne } from '../utils/handlerFactory.js';

const searchFields = ['name', 'number'];

export const getAppointments = getAll(Appointment, { searchFields });
export const getAppointment = getOne(Appointment, { populate: 'lead' });
export const createAppointment = createOne(Appointment);
export const updateAppointment = updateOne(Appointment);
export const deleteAppointment = deleteOne(Appointment);
