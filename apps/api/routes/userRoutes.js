import { Router } from 'express';
import { body, param } from 'express-validator';
import { getUsers, getUser, updateUser, deleteUser } from '../controllers/userController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import validate from '../middleware/validate.js';
import { assertRoleExists } from '../utils/roles.js';

const router = Router();

router.use(protect, authorize('Admin'));

router.get('/', getUsers);

router.get('/:id', [param('id').isMongoId().withMessage('Invalid user id')], validate, getUser);

router.patch(
  '/:id',
  [
    param('id').isMongoId().withMessage('Invalid user id'),
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('role').optional().custom(assertRoleExists),
    // toBoolean so the string "false" can't slip past the self-deactivation check.
    body('isActive').optional().isBoolean().withMessage('isActive must be a boolean').toBoolean(true),
  ],
  validate,
  updateUser
);

router.delete('/:id', [param('id').isMongoId().withMessage('Invalid user id')], validate, deleteUser);

export default router;
