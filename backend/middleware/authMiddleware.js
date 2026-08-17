import jwt from 'jsonwebtoken';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import User from '../models/User.js';

export const protect = asyncHandler(async (req, res, next) => {
  let token;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    throw new AppError('Not authorized. No token provided.', 401);
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const user = await User.findById(decoded.id).select('-password');
  if (!user) {
    throw new AppError('Not authorized. User no longer exists.', 401);
  }

  if (!user.isActive) {
    throw new AppError('Not authorized. Account is deactivated.', 401);
  }

  req.user = user;
  next();
});

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new AppError('Not authorized. No user attached to request.', 401);
    }

    if (!roles.includes(req.user.role)) {
      throw new AppError(`Role '${req.user.role}' is not permitted to perform this action.`, 403);
    }

    next();
  };
};
