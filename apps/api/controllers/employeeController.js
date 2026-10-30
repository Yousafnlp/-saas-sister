import Employee from '../models/Employee.js';
import { getAll, getOne, createOne, updateOne, deleteOne } from '../utils/handlerFactory.js';

const searchFields = ['name', 'email'];

export const getEmployees = getAll(Employee, { searchFields });
export const getEmployee = getOne(Employee);
export const createEmployee = createOne(Employee);
export const updateEmployee = updateOne(Employee);
export const deleteEmployee = deleteOne(Employee);
