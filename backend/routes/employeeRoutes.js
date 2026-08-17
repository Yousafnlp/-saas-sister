import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from '../controllers/employeeController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import validate from '../middleware/validate.js';

const router = Router();

const idParam = param('id').isMongoId().withMessage('Invalid employee id');

const fieldRules = (optional) => [
  body('name')[optional ? 'optional' : 'exists']().trim().notEmpty().withMessage('Name is required'),
  body('email')[optional ? 'optional' : 'exists']()
    .isEmail()
    .withMessage('A valid email is required')
    .normalizeEmail(),
  body('department')[optional ? 'optional' : 'exists']()
    .isIn(['Doctor (DR)', 'Technician', 'Management'])
    .withMessage('Invalid department'),
  body('salary')[optional ? 'optional' : 'exists']()
    .isFloat({ min: 0 })
    .withMessage('Salary must be a non-negative number'),
  body('joinDate')[optional ? 'optional' : 'exists']()
    .isISO8601()
    .withMessage('joinDate must be a valid date'),
  body('status').optional().isIn(['Active', 'Inactive']).withMessage('Invalid status'),
  body('timings').optional().trim(),
  body('damages').optional().isFloat({ min: 0 }).withMessage('Damages must be a non-negative number'),
  body('benefits').optional().trim(),
  body('payrollReceiving').optional().trim(),
];

const createRules = fieldRules(false);
const updateRules = fieldRules(true);

router.use(protect);

router.get('/', getEmployees);
router.get('/:id', [idParam], validate, getEmployee);

router.post('/', authorize('Admin', 'Manager'), createRules, validate, createEmployee);
router.put('/:id', authorize('Admin', 'Manager'), [idParam, ...updateRules], validate, updateEmployee);
router.delete('/:id', authorize('Admin'), [idParam], validate, deleteEmployee);

export default router;
