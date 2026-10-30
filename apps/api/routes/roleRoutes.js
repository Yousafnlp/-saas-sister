import { Router } from 'express';
import { body, param } from 'express-validator';
import { getRoles, createRole, updateRole, deleteRole } from '../controllers/roleController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import validate from '../middleware/validate.js';
import { PERMISSIONS } from '@daesthetics/shared';

const router = Router();

// Roles are addressed by name, which is what users and invites store.
const nameParam = param('name').trim().notEmpty().withMessage('Role name is required');

const fieldRules = (optional) => [
  body('name')[optional ? 'optional' : 'exists']()
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 40 })
    .withMessage('Name can be at most 40 characters'),
  body('permissions')[optional ? 'optional' : 'exists']().isArray().withMessage('permissions must be a list'),
  body('permissions.*').isIn(PERMISSIONS).withMessage('Unknown permission'),
];

// Only Admins manage roles; otherwise someone could grant their own role more access.
router.use(protect, authorize('Admin'));

router.get('/', getRoles);
router.post('/', fieldRules(false), validate, createRole);
router.put('/:name', [nameParam, ...fieldRules(true)], validate, updateRole);
router.delete('/:name', [nameParam], validate, deleteRole);

export default router;
