import { Router } from 'express';
import { body, param } from 'express-validator';
import { getLeads, getLead, createLead, updateLead, deleteLead } from '../controllers/leadController.js';
import { protect, requirePermission } from '../middleware/authMiddleware.js';
import validate from '../middleware/validate.js';
import { CITY_OPTIONS, GENDER_OPTIONS, LEAD_CATEGORY_OPTIONS, LEAD_SOURCE_OPTIONS } from '@daesthetics/shared';

const router = Router();

const idParam = param('id').isMongoId().withMessage('Invalid lead id');

const fieldRules = (optional) => [
  body('name')[optional ? 'optional' : 'exists']().trim().notEmpty().withMessage('Name is required'),
  body('number')[optional ? 'optional' : 'exists']()
    .trim()
    .notEmpty()
    .withMessage('Phone number is required'),
  body('source')[optional ? 'optional' : 'exists']().isIn(LEAD_SOURCE_OPTIONS).withMessage('Invalid source'),
  body('city')[optional ? 'optional' : 'exists']().isIn(CITY_OPTIONS).withMessage('Invalid city'),
  body('gender')[optional ? 'optional' : 'exists']().isIn(GENDER_OPTIONS).withMessage('Invalid gender'),
  body('category')[optional ? 'optional' : 'exists']().isIn(LEAD_CATEGORY_OPTIONS).withMessage('Invalid category'),
];

router.use(protect, requirePermission('leads'));

router.get('/', getLeads);
router.get('/:id', [idParam], validate, getLead);

router.post('/', fieldRules(false), validate, createLead);
router.put('/:id', [idParam, ...fieldRules(true)], validate, updateLead);
router.delete('/:id', [idParam], validate, deleteLead);

export default router;
