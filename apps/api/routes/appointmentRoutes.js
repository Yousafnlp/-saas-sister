import { Router } from 'express';
import { body, param, query } from 'express-validator';
import {
  getAppointments,
  getCalendarAppointments,
  getAppointment,
  createAppointment,
  updateAppointment,
  deleteAppointment,
} from '../controllers/appointmentController.js';
import { protect, requirePermission } from '../middleware/authMiddleware.js';
import validate from '../middleware/validate.js';
import { APPOINTMENT_SERVICE_OPTIONS, APPOINTMENT_STATUS_OPTIONS } from '@daesthetics/shared';

const router = Router();

const idParam = param('id').isMongoId().withMessage('Invalid appointment id');
const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

const fieldRules = (optional) => [
  body('lead').optional({ nullable: true }).isMongoId().withMessage('lead must be a valid id'),
  body('name')[optional ? 'optional' : 'exists']().trim().notEmpty().withMessage('Name is required'),
  body('number')[optional ? 'optional' : 'exists']()
    .trim()
    .notEmpty()
    .withMessage('Phone number is required'),
  body('service')[optional ? 'optional' : 'exists']().isIn(APPOINTMENT_SERVICE_OPTIONS).withMessage('Invalid service'),
  body('date')[optional ? 'optional' : 'exists']().isISO8601().withMessage('date must be a valid date'),
  body('time')[optional ? 'optional' : 'exists']()
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage('time must be in HH:mm format'),
  body('status').optional().isIn(APPOINTMENT_STATUS_OPTIONS).withMessage('Invalid status'),
  body('notes').optional().trim(),
  body('branch').optional({ nullable: true }).isMongoId().withMessage('branch must be a valid id'),
  body('treatment').optional().trim(),
];

const calendarRules = [
  query('from').matches(DATE_ONLY).isISO8601({ strict: true }).withMessage('from must be a date (YYYY-MM-DD)'),
  query('to').matches(DATE_ONLY).isISO8601({ strict: true }).withMessage('to must be a date (YYYY-MM-DD)'),
  query('branch').optional().isMongoId().withMessage('branch must be a valid id'),
];

router.use(protect, requirePermission('appointments'));

router.get('/', getAppointments);
router.get('/calendar', calendarRules, validate, getCalendarAppointments);
router.get('/:id', [idParam], validate, getAppointment);

router.post('/', fieldRules(false), validate, createAppointment);
router.put('/:id', [idParam, ...fieldRules(true)], validate, updateAppointment);
router.delete('/:id', [idParam], validate, deleteAppointment);

export default router;
