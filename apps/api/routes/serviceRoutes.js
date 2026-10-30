import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  getServices,
  getService,
  createService,
  updateService,
  deleteService,
  importDefaults,
} from '../controllers/serviceController.js';
import { protect, requirePermission } from '../middleware/authMiddleware.js';
import validate from '../middleware/validate.js';

const router = Router();

const idParam = param('id').isMongoId().withMessage('Invalid service id');

const fieldRules = (optional) => [
  body('name')[optional ? 'optional' : 'exists']().trim().notEmpty().withMessage('Name is required'),
  body('category')[optional ? 'optional' : 'exists']().trim().notEmpty().withMessage('Category is required'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),
  body('note').optional().trim(),
  body('isActive').optional().isBoolean().withMessage('isActive must be true or false'),
  body('showOnline').optional().isBoolean().withMessage('showOnline must be true or false'),
];

router.use(protect);

router.get('/', getServices);
router.get('/:id', [idParam], validate, getService);

router.post('/import-defaults', requirePermission('services'), importDefaults);
router.post('/', requirePermission('services'), fieldRules(false), validate, createService);
router.put('/:id', requirePermission('services'), [idParam, ...fieldRules(true)], validate, updateService);
router.delete('/:id', requirePermission('services'), [idParam], validate, deleteService);

export default router;
