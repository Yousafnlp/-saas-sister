import { Router } from 'express';
import { body, param } from 'express-validator';
import { getLeads, getLead, createLead, updateLead, deleteLead } from '../controllers/leadController.js';
import { protect } from '../middleware/authMiddleware.js';
import validate from '../middleware/validate.js';

const router = Router();

const idParam = param('id').isMongoId().withMessage('Invalid lead id');

const SOURCES = ['Instagram', 'WhatsApp', 'Google'];
const CITIES = ['Lahore', 'Islamabad', 'Karachi', 'Sialkot'];
const GENDERS = ['Male', 'Female', 'Unknown'];
const CATEGORIES = [
  'LHR Leads',
  'Skt Leads',
  'Potential',
  'Salon & Common',
  'Lash & Nails',
  'Offer & Deals',
  'Institute',
  'Clients',
  'Interested',
  'Pending Payment',
  'Vendors',
  'Jobs',
  'Bloggers & PR',
  'Wellness',
  'Lead',
  'New Order',
  'Advanced',
  'Packages',
  'Important',
];

const fieldRules = (optional) => [
  body('name')[optional ? 'optional' : 'exists']().trim().notEmpty().withMessage('Name is required'),
  body('number')[optional ? 'optional' : 'exists']()
    .trim()
    .notEmpty()
    .withMessage('Phone number is required'),
  body('source')[optional ? 'optional' : 'exists']().isIn(SOURCES).withMessage('Invalid source'),
  body('city')[optional ? 'optional' : 'exists']().isIn(CITIES).withMessage('Invalid city'),
  body('gender')[optional ? 'optional' : 'exists']().isIn(GENDERS).withMessage('Invalid gender'),
  body('category')[optional ? 'optional' : 'exists']().isIn(CATEGORIES).withMessage('Invalid category'),
];

router.use(protect);

router.get('/', getLeads);
router.get('/:id', [idParam], validate, getLead);

router.post('/', fieldRules(false), validate, createLead);
router.put('/:id', [idParam, ...fieldRules(true)], validate, updateLead);
router.delete('/:id', [idParam], validate, deleteLead);

export default router;
