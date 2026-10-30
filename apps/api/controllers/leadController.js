import Lead from '../models/Lead.js';
import { getAll, getOne, createOne, updateOne, deleteOne } from '../utils/handlerFactory.js';

const searchFields = ['name', 'number'];

export const getLeads = getAll(Lead, { searchFields });
export const getLead = getOne(Lead);
export const createLead = createOne(Lead);
export const updateLead = updateOne(Lead);
export const deleteLead = deleteOne(Lead);
