import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  getExpenses,
  getExpense,
  createExpense,
  updateExpense,
  deleteExpense,
} from '../controllers/expenseController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import validate from '../middleware/validate.js';

const router = Router();

const idParam = param('id').isMongoId().withMessage('Invalid expense id');

const CATEGORIES = ['Travel', 'Meals', 'Office Supplies', 'Equipment', 'Software', 'Other'];

const fieldRules = (optional) => [
  body('date')[optional ? 'optional' : 'exists']().isISO8601().withMessage('date must be a valid date'),
  body('category')[optional ? 'optional' : 'exists']().isIn(CATEGORIES).withMessage('Invalid category'),
  body('amount')[optional ? 'optional' : 'exists']()
    .isFloat({ min: 0 })
    .withMessage('Amount must be a non-negative number'),
  body('description').optional().trim(),
  body('status').optional().isIn(['Pending', 'Approved', 'Rejected']).withMessage('Invalid status'),
  body('submittedBy').optional().trim().notEmpty().withMessage('submittedBy cannot be empty'),
];

router.use(protect);

router.get('/', getExpenses);
router.get('/:id', [idParam], validate, getExpense);

router.post('/', fieldRules(false), validate, createExpense);
router.put(
  '/:id',
  authorize('Admin', 'Manager'),
  [idParam, ...fieldRules(true)],
  validate,
  updateExpense
);
router.delete('/:id', authorize('Admin'), [idParam], validate, deleteExpense);

export default router;
