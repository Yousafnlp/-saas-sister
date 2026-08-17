import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import generateToken from '../utils/generateToken.js';
import User from '../models/User.js';

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    throw new AppError('An account with this email already exists', 409);
  }

  // Self-registration is always Staff. Admins promote users via PATCH /api/users/:id.
  const user = await User.create({ name, email, password, role: 'Staff' });

  const token = generateToken(user._id);
  res.status(201).json({ success: true, token, data: user.toSafeObject() });
});

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
  res.status(200).json({ success: true, token, data: user.toSafeObject() });
});

export const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, data: req.user.toSafeObject() });
});
