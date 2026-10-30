import Bill from '../models/Bill.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import { getAll, getOne, createOne, deleteOne } from '../utils/handlerFactory.js';

const searchFields = ['clientName', 'clientNumber', 'invoiceNumber'];

export const getBills = getAll(Bill, { searchFields });
export const getBill = getOne(Bill);
export const createBill = createOne(Bill);

export const updateBill = asyncHandler(async (req, res) => {
  const bill = await Bill.findById(req.params.id);
  if (!bill) {
    throw new AppError(`Bill not found with id ${req.params.id}`, 404);
  }

  Object.assign(bill, req.body);
  await bill.save();

  res.status(200).json({ success: true, data: bill });
});

export const deleteBill = deleteOne(Bill);
