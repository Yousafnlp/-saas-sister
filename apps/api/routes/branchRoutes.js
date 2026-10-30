import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  getBranches,
  getBranch,
  createBranch,
  updateBranch,
  deleteBranch,
} from '../controllers/branchController.js';
import { protect, requirePermission } from '../middleware/authMiddleware.js';
import validate from '../middleware/validate.js';
import { BOOKING_SLOT_MINUTE_OPTIONS, WEEKDAY_OPTIONS } from '@daesthetics/shared';

const router = Router();

const idParam = param('id').isMongoId().withMessage('Invalid branch id');
const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

const fieldRules = (optional) => [
  body('name')[optional ? 'optional' : 'exists']().trim().notEmpty().withMessage('Name is required'),
  body('slug')[optional ? 'optional' : 'exists']()
    .trim()
    .toLowerCase()
    .matches(/^[a-z0-9]+(-[a-z0-9]+)*$/)
    .withMessage('Booking link name can only use letters, numbers and dashes'),
  body('city').optional().trim(),
  body('address').optional().trim(),
  body('phone').optional().trim(),
  body('openingTime').optional().matches(TIME_PATTERN).withMessage('openingTime must be in HH:mm format'),
  body('closingTime').optional().matches(TIME_PATTERN).withMessage('closingTime must be in HH:mm format'),
  body('workingDays').optional().isArray({ min: 1 }).withMessage('Pick at least one day the branch is open'),
  body('workingDays.*').optional().isIn(WEEKDAY_OPTIONS).withMessage('Invalid working day'),
  body('slotMinutes').optional().isIn(BOOKING_SLOT_MINUTE_OPTIONS).withMessage('Invalid slot length'),
  body('slotCapacity').optional().isInt({ min: 1, max: 50 }).withMessage('Bookings per slot must be 1-50'),
  body('bookingEnabled').optional().isBoolean().withMessage('bookingEnabled must be true or false'),
  body('isActive').optional().isBoolean().withMessage('isActive must be true or false'),
];

router.use(protect);

router.get('/', getBranches);
router.get('/:id', [idParam], validate, getBranch);

router.post('/', requirePermission('branches'), fieldRules(false), validate, createBranch);
router.put('/:id', requirePermission('branches'), [idParam, ...fieldRules(true)], validate, updateBranch);
router.delete('/:id', requirePermission('branches'), [idParam], validate, deleteBranch);

export default router;
