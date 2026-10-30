import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  getBills,
  getBill,
  createBill,
  updateBill,
  deleteBill,
} from '../controllers/billController.js';
import { protect, requirePermission } from '../middleware/authMiddleware.js';
import validate from '../middleware/validate.js';
import { BILLING_PAYMENT_METHOD_OPTIONS, BILLING_PAYMENT_STATUS_OPTIONS } from '@daesthetics/shared';

const router = Router();

const idParam = param('id').isMongoId().withMessage('Invalid bill id');

const fieldRules = (optional) => [
  body('clientName')[optional ? 'optional' : 'exists']().trim().notEmpty().withMessage('Client name is required'),
  body('clientNumber')[optional ? 'optional' : 'exists']().trim().notEmpty().withMessage('Client number is required'),
  body('date')[optional ? 'optional' : 'exists']().isISO8601().withMessage('date must be a valid date'),
  body('items')[optional ? 'optional' : 'exists']().isArray({ min: 1 }).withMessage('At least one service item is required'),
  body('items.*.name').if(body('items').exists()).trim().notEmpty().withMessage('Item name is required'),
  body('items.*.price').if(body('items').exists()).isFloat({ min: 0 }).withMessage('Item price must be a non-negative number'),
  body('items.*.quantity').optional().isInt({ min: 1 }).withMessage('Item quantity must be at least 1'),
  body('discount').optional().isFloat({ min: 0 }).withMessage('Discount must be a non-negative number'),
  body('paymentMethod').optional().isIn(BILLING_PAYMENT_METHOD_OPTIONS).withMessage('Invalid payment method'),
  body('paymentStatus').optional().isIn(BILLING_PAYMENT_STATUS_OPTIONS).withMessage('Invalid payment status'),
  body('amountPaid').optional().isFloat({ min: 0 }).withMessage('Amount paid must be a non-negative number'),
  body('notes').optional().trim(),
];

router.use(protect);

// A client's page lists their bills, so client access can read bills too.
const canRead = requirePermission('billing', 'clients');
const canEdit = requirePermission('billing');

router.get('/', canRead, getBills);
router.get('/:id', canRead, [idParam], validate, getBill);

router.post('/', canEdit, fieldRules(false), validate, createBill);
router.put('/:id', canEdit, [idParam, ...fieldRules(true)], validate, updateBill);
router.delete('/:id', canEdit, [idParam], validate, deleteBill);

export default router;
