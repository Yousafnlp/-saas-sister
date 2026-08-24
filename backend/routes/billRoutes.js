import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  getBills,
  getBill,
  createBill,
  updateBill,
  deleteBill,
} from '../controllers/billController.js';
import { protect } from '../middleware/authMiddleware.js';
import validate from '../middleware/validate.js';

const router = Router();

const idParam = param('id').isMongoId().withMessage('Invalid bill id');

const PAYMENT_METHODS = ['Cash', 'Card', 'Bank Transfer', 'Easypaisa/JazzCash'];
const PAYMENT_STATUSES = ['Paid', 'Pending'];

const fieldRules = (optional) => [
  body('clientName')[optional ? 'optional' : 'exists']().trim().notEmpty().withMessage('Client name is required'),
  body('clientNumber')[optional ? 'optional' : 'exists']().trim().notEmpty().withMessage('Client number is required'),
  body('date')[optional ? 'optional' : 'exists']().isISO8601().withMessage('date must be a valid date'),
  body('items')[optional ? 'optional' : 'exists']().isArray({ min: 1 }).withMessage('At least one service item is required'),
  body('items.*.name').if(body('items').exists()).trim().notEmpty().withMessage('Item name is required'),
  body('items.*.price').if(body('items').exists()).isFloat({ min: 0 }).withMessage('Item price must be a non-negative number'),
  body('items.*.quantity').optional().isInt({ min: 1 }).withMessage('Item quantity must be at least 1'),
  body('discount').optional().isFloat({ min: 0 }).withMessage('Discount must be a non-negative number'),
  body('paymentMethod').optional().isIn(PAYMENT_METHODS).withMessage('Invalid payment method'),
  body('paymentStatus').optional().isIn(PAYMENT_STATUSES).withMessage('Invalid payment status'),
  body('amountPaid').optional().isFloat({ min: 0 }).withMessage('Amount paid must be a non-negative number'),
  body('notes').optional().trim(),
];

router.use(protect);

router.get('/', getBills);
router.get('/:id', [idParam], validate, getBill);

router.post('/', fieldRules(false), validate, createBill);
router.put('/:id', [idParam, ...fieldRules(true)], validate, updateBill);
router.delete('/:id', [idParam], validate, deleteBill);

export default router;
