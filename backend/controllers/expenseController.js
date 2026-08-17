import Expense from '../models/Expense.js';
import asyncHandler from '../utils/asyncHandler.js';
import { getAll, getOne, updateOne, deleteOne } from '../utils/handlerFactory.js';

const searchFields = ['description', 'category', 'submittedBy'];

export const getExpenses = getAll(Expense, { searchFields });
export const getExpense = getOne(Expense);

export const createExpense = asyncHandler(async (req, res) => {
  const submittedBy = req.body.submittedBy || req.user.name;
  const expense = await Expense.create({ ...req.body, submittedBy });
  res.status(201).json({ success: true, data: expense });
});

export const updateExpense = updateOne(Expense);
export const deleteExpense = deleteOne(Expense);
