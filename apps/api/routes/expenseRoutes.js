import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  getExpenses,
  getExpense,
  createExpense,
  updateExpense,
  deleteExpense,
} from '../controllers/expenseController.js';
import { protect, requirePermission } from '../middleware/authMiddleware.js';
import validate from '../middleware/validate.js';
import { CITY_OPTIONS, EXPENSE_CATEGORY_OPTIONS, EXPENSE_STATUS_OPTIONS } from '@daesthetics/shared';

const router = Router();

const idParam = param('id').isMongoId().withMessage('Invalid expense id');

const fieldRules = (optional) => [
  body('date')[optional ? 'optional' : 'exists']().isISO8601().withMessage('date must be a valid date'),
  body('category')[optional ? 'optional' : 'exists']().isIn(EXPENSE_CATEGORY_OPTIONS).withMessage('Invalid category'),
  body('city')[optional ? 'optional' : 'exists']().isIn(CITY_OPTIONS).withMessage('Invalid city'),
  body('amount')[optional ? 'optional' : 'exists']()
    .isFloat({ min: 0 })
    .withMessage('Amount must be a non-negative number'),
  body('description').optional().trim(),
  body('status').optional().isIn(EXPENSE_STATUS_OPTIONS).withMessage('Invalid status'),
  body('submittedBy').optional().trim().notEmpty().withMessage('submittedBy cannot be empty'),
];

router.use(protect, requirePermission('expenses'));

router.get('/', getExpenses);
router.get('/:id', [idParam], validate, getExpense);

router.post('/', fieldRules(false), validate, createExpense);
router.put(
  '/:id',
  requirePermission('expenses.approve'),
  [idParam, ...fieldRules(true)],
  validate,
  updateExpense
);
router.delete('/:id', requirePermission('expenses.approve'), [idParam], validate, deleteExpense);

export default router;
