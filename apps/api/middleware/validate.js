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

// For pages the public sees (booking, invite links): only the first problem, in plain words.
export function validatePublic(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError(errors.array()[0].msg, 400));
  }
  next();
}

export default validate;
