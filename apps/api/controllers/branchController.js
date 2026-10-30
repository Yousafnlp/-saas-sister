import Branch from '../models/Branch.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import { getAll, getOne, createOne, deleteOne } from '../utils/handlerFactory.js';

const searchFields = ['name', 'city', 'slug'];

export const getBranches = getAll(Branch, { searchFields });
export const getBranch = getOne(Branch);
export const createBranch = createOne(Branch);
export const deleteBranch = deleteOne(Branch);

// Loads and saves (rather than findByIdAndUpdate) so the opening/closing hours check runs.
export const updateBranch = asyncHandler(async (req, res) => {
  const branch = await Branch.findById(req.params.id);
  if (!branch) {
    throw new AppError(`Branch not found with id ${req.params.id}`, 404);
  }

  Object.assign(branch, req.body);
  await branch.save();
  res.status(200).json({ success: true, data: branch });
});
