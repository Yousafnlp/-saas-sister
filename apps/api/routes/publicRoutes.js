import { Router } from 'express';
import { body, param, query } from 'express-validator';
import rateLimit from 'express-rate-limit';
import {
  listBookableBranches,
  getBookingPage,
  getAvailability,
  createBooking,
} from '../controllers/publicController.js';
import { validatePublic } from '../middleware/validate.js';
import { isValidPhone } from '../utils/phone.js';

// Routes for the public online booking page. No login required.
const router = Router();

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

const slugParam = param('slug').trim().toLowerCase().matches(/^[a-z0-9-]+$/).withMessage('This booking page does not exist.');

const bookingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  // Only bookings that went through count, so a client fixing typos is never locked out.
  skipFailedRequests: true,
  message: { success: false, error: { message: 'Too many bookings from this device. Please try again later.' } },
});

const bookingRules = [
  slugParam,
  body('name').trim().notEmpty().withMessage('Please enter your name').isLength({ max: 100 }).withMessage('Name is too long'),
  body('number').trim().custom(isValidPhone).withMessage('Please enter a valid phone number, e.g. 0300-1234567'),
  body('date', 'Please pick a date').matches(DATE_ONLY).bail().isISO8601({ strict: true }),
  body('time', 'Please pick a time').matches(/^([01]\d|2[0-3]):([0-5]\d)$/),
  body('serviceId').optional({ values: 'falsy' }).isMongoId().withMessage('Invalid service'),
  body('notes').optional().trim().isLength({ max: 500 }).withMessage('Notes can be at most 500 characters'),
];

router.get('/branches', listBookableBranches);
router.get('/branches/:slug', [slugParam], validatePublic, getBookingPage);
router.get(
  '/branches/:slug/availability',
  [slugParam, query('date', 'Please pick a valid date').matches(DATE_ONLY).bail().isISO8601({ strict: true })],
  validatePublic,
  getAvailability
);
router.post('/branches/:slug/bookings', bookingLimiter, bookingRules, validatePublic, createBooking);

export default router;
