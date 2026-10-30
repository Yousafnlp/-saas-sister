import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  getPayrolls,
  getPayroll,
  createPayroll,
  processPayroll,
  updatePayroll,
  deletePayroll,
} from '../controllers/payrollController.js';
import { protect, requirePermission } from '../middleware/authMiddleware.js';
import validate from '../middleware/validate.js';
import { PAYROLL_STATUS_OPTIONS } from '@daesthetics/shared';

const router = Router();

const idParam = param('id').isMongoId().withMessage('Invalid payroll id');

const createRules = [
  body('employee').optional().isMongoId().withMessage('employee must be a valid id'),
  body('employeeEmail').optional().isEmail().withMessage('employeeEmail must be a valid email'),
  body().custom((value) => {
    if (!value.employee && !value.employeeEmail) {
      throw new Error('Either employee (id) or employeeEmail is required');
    }
    return true;
  }),
  body('month').trim().notEmpty().withMessage('Month is required'),
  body('baseSalary').isFloat({ min: 0 }).withMessage('baseSalary must be a non-negative number'),
  body('bonus').optional().isFloat({ min: 0 }).withMessage('bonus must be a non-negative number'),
  body('deductions').optional().isFloat({ min: 0 }).withMessage('deductions must be a non-negative number'),
];

const updateRules = [
  body('month').optional().trim().notEmpty().withMessage('Month cannot be empty'),
  body('baseSalary').optional().isFloat({ min: 0 }).withMessage('baseSalary must be a non-negative number'),
  body('bonus').optional().isFloat({ min: 0 }).withMessage('bonus must be a non-negative number'),
  body('deductions').optional().isFloat({ min: 0 }).withMessage('deductions must be a non-negative number'),
  body('status').optional().isIn(PAYROLL_STATUS_OPTIONS).withMessage('Invalid status'),
];

router.use(protect, requirePermission('payroll'));

router.get('/', getPayrolls);
router.get('/:id', [idParam], validate, getPayroll);

router.post('/', createRules, validate, createPayroll);
router.patch('/:id/process', [idParam], validate, processPayroll);
router.put('/:id', [idParam, ...updateRules], validate, updatePayroll);
router.delete('/:id', [idParam], validate, deletePayroll);

export default router;
