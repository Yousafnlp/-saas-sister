import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  getClients,
  getClient,
  createClient,
  updateClient,
  deleteClient,
} from '../controllers/clientController.js';
import { protect } from '../middleware/authMiddleware.js';
import validate from '../middleware/validate.js';

const router = Router();

const idParam = param('id').isMongoId().withMessage('Invalid client id');

const GENDERS = ['Male', 'Female', 'Unknown'];

const fieldRules = (optional) => [
  body('name')[optional ? 'optional' : 'exists']().trim().notEmpty().withMessage('Name is required'),
  body('date')[optional ? 'optional' : 'exists']().isISO8601().withMessage('date must be a valid date'),
  body('age').optional().isInt({ min: 0 }).withMessage('age must be a non-negative integer'),
  body('gender').optional().isIn(GENDERS).withMessage('Invalid gender'),
  body('concern').optional().trim(),
  body('nextVisit').optional().isISO8601().withMessage('nextVisit must be a valid date'),
];

router.use(protect);

router.get('/', getClients);
router.get('/:id', [idParam], validate, getClient);

router.post('/', fieldRules(false), validate, createClient);
router.put('/:id', [idParam, ...fieldRules(true)], validate, updateClient);
router.delete('/:id', [idParam], validate, deleteClient);

export default router;
