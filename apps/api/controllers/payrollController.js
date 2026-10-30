import Payroll from '../models/Payroll.js';
import Employee from '../models/Employee.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import { getAll, getOne, updateOne, deleteOne } from '../utils/handlerFactory.js';

const searchFields = ['employeeName', 'employeeEmail', 'month'];

export const getPayrolls = getAll(Payroll, { searchFields });
export const getPayroll = getOne(Payroll, { populate: 'employee' });

export const createPayroll = asyncHandler(async (req, res) => {
  const { employee: employeeId, employeeEmail, month, baseSalary, bonus, deductions } = req.body;

  const employee = employeeId
    ? await Employee.findById(employeeId)
    : await Employee.findOne({ email: employeeEmail?.toLowerCase() });

  if (!employee) {
    throw new AppError('No employee found matching the given employee id/email', 404);
  }

  const payroll = await Payroll.create({
    employee: employee._id,
    employeeName: employee.name,
    employeeEmail: employee.email,
    month,
    baseSalary,
    bonus,
    deductions,
  });

  res.status(201).json({ success: true, data: payroll });
});

export const processPayroll = asyncHandler(async (req, res) => {
  const payroll = await Payroll.findByIdAndUpdate(
    req.params.id,
    { status: 'Processed' },
    { new: true, runValidators: true }
  );

  if (!payroll) {
    throw new AppError(`Payroll not found with id ${req.params.id}`, 404);
  }

  res.status(200).json({ success: true, data: payroll });
});

export const updatePayroll = updateOne(Payroll);
export const deletePayroll = deleteOne(Payroll);
