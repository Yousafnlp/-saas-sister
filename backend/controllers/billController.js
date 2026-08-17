import Bill from '../models/Bill.js';
import { getAll, getOne, createOne, updateOne, deleteOne } from '../utils/handlerFactory.js';

const searchFields = ['clientName', 'clientNumber', 'invoiceNumber'];

export const getBills = getAll(Bill, { searchFields });
export const getBill = getOne(Bill);
export const createBill = createOne(Bill);
export const updateBill = updateOne(Bill);
export const deleteBill = deleteOne(Bill);
