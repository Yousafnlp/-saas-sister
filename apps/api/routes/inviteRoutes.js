import { Router } from 'express';
import { body, param } from 'express-validator';
import { getInvites, createInvite, regenerateInvite, deleteInvite } from '../controllers/inviteController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import validate from '../middleware/validate.js';
import { assertRoleExists } from '../utils/roles.js';

const router = Router();

const idParam = param('id').isMongoId().withMessage('Invalid invite id');

router.use(protect, authorize('Admin'));

router.get('/', getInvites);

router.post(
  '/',
  [
    body('email').isEmail().withMessage('A valid email is required').normalizeEmail(),
    body('name').optional().trim(),
    body('role').custom(assertRoleExists),
  ],
  validate,
  createInvite
);

router.post('/:id/regenerate', [idParam], validate, regenerateInvite);
router.delete('/:id', [idParam], validate, deleteInvite);

export default router;
