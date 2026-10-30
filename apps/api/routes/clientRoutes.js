import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  getClients,
  getClient,
  createClient,
  updateClient,
  deleteClient,
} from '../controllers/clientController.js';
import { protect, requirePermission } from '../middleware/authMiddleware.js';
import validate from '../middleware/validate.js';
import { GENDER_OPTIONS } from '@daesthetics/shared';

const router = Router();

const idParam = param('id').isMongoId().withMessage('Invalid client id');

const fieldRules = (optional) => [
  body('name')[optional ? 'optional' : 'exists']().trim().notEmpty().withMessage('Name is required'),
  body('number').optional().trim(),
  body('date')[optional ? 'optional' : 'exists']().isISO8601().withMessage('date must be a valid date'),
  body('age').optional().isInt({ min: 0 }).withMessage('age must be a non-negative integer'),
  body('gender').optional().isIn(GENDER_OPTIONS).withMessage('Invalid gender'),
  body('concern').optional().trim(),
  body('nextVisit').optional().isISO8601().withMessage('nextVisit must be a valid date'),
  body('treatmentPlan').optional().trim(),
  body('treatmentHistory').optional().trim(),
];

router.use(protect);

// Billing picks clients from this list, so it can read clients too.
const canRead = requirePermission('clients', 'billing');
const canEdit = requirePermission('clients');

router.get('/', canRead, getClients);
router.get('/:id', canRead, [idParam], validate, getClient);

router.post('/', canEdit, fieldRules(false), validate, createClient);
router.put('/:id', canEdit, [idParam, ...fieldRules(true)], validate, updateClient);
router.delete('/:id', canEdit, [idParam], validate, deleteClient);

export default router;
