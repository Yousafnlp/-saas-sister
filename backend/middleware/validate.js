import { validationResult } from 'express-validator';
import AppError from '../utils/AppError.js';

export function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((e) => `${e.path}: ${e.msg}`);
    return next(new AppError(`Validation failed: ${messages.join(', ')}`, 400));
  }
  next();
}

export default validate;
