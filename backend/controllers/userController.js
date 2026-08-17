import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import User from '../models/User.js';
import ApiFeatures from '../utils/apiFeatures.js';

export const getUsers = asyncHandler(async (req, res) => {
  const features = new ApiFeatures(User.find(), req.query, ['name', 'email'])
    .filter()
    .search()
    .sort()
    .limitFields()
    .paginate();

  const [users, total] = await Promise.all([
    features.query,
    User.countDocuments(features.query.getFilter()),
  ]);

  res.status(200).json({
    success: true,
    count: users.length,
    total,
    page: features.pagination.page,
    pages: Math.ceil(total / features.pagination.limit),
    data: users,
  });
});

export const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new AppError(`User not found with id ${req.params.id}`, 404);
  res.status(200).json({ success: true, data: user });
});

export const updateUser = asyncHandler(async (req, res) => {
  const { name, role, isActive } = req.body;

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { name, role, isActive },
    { new: true, runValidators: true, omitUndefined: true }
  );

  if (!user) throw new AppError(`User not found with id ${req.params.id}`, 404);
  res.status(200).json({ success: true, data: user });
});

export const deleteUser = asyncHandler(async (req, res) => {
  if (req.params.id === String(req.user._id)) {
    throw new AppError('You cannot delete your own account', 400);
  }

  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) throw new AppError(`User not found with id ${req.params.id}`, 404);
  res.status(200).json({ success: true, data: {} });
});
