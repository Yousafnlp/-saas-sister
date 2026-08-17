import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  getAppointments,
  getAppointment,
  createAppointment,
  updateAppointment,
  deleteAppointment,
} from '../controllers/appointmentController.js';
import { protect } from '../middleware/authMiddleware.js';
import validate from '../middleware/validate.js';

const router = Router();

const idParam = param('id').isMongoId().withMessage('Invalid appointment id');

const SERVICES = ['Consultation', 'Follow-up', 'Treatment', 'Procedure'];
const STATUSES = ['Scheduled', 'Confirmed', 'Completed', 'Cancelled'];

const fieldRules = (optional) => [
  body('lead').optional({ nullable: true }).isMongoId().withMessage('lead must be a valid id'),
  body('name')[optional ? 'optional' : 'exists']().trim().notEmpty().withMessage('Name is required'),
  body('number')[optional ? 'optional' : 'exists']()
    .trim()
    .notEmpty()
    .withMessage('Phone number is required'),
  body('service')[optional ? 'optional' : 'exists']().isIn(SERVICES).withMessage('Invalid service'),
  body('date')[optional ? 'optional' : 'exists']().isISO8601().withMessage('date must be a valid date'),
  body('time')[optional ? 'optional' : 'exists']()
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage('time must be in HH:mm format'),
  body('status').optional().isIn(STATUSES).withMessage('Invalid status'),
  body('notes').optional().trim(),
];

router.use(protect);

router.get('/', getAppointments);
router.get('/:id', [idParam], validate, getAppointment);

router.post('/', fieldRules(false), validate, createAppointment);
router.put('/:id', [idParam, ...fieldRules(true)], validate, updateAppointment);
router.delete('/:id', [idParam], validate, deleteAppointment);

export default router;
