import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import generateToken from '../utils/generateToken.js';
import User from '../models/User.js';
import { sessionUser } from '../utils/roles.js';

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password', 401);
  }

  if (!user.isActive) {
    throw new AppError('This account has been deactivated', 401);
  }

  const token = generateToken(user._id);
  res.status(200).json({ success: true, token, data: await sessionUser(user) });
});

export const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, data: await sessionUser(req.user, req.permissions) });
});
