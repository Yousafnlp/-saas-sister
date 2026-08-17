import { Router } from 'express';
import { body, param } from 'express-validator';
import { getUsers, getUser, updateUser, deleteUser } from '../controllers/userController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import validate from '../middleware/validate.js';

const router = Router();

router.use(protect, authorize('Admin'));

router.get('/', getUsers);

router.get('/:id', [param('id').isMongoId().withMessage('Invalid user id')], validate, getUser);

router.patch(
  '/:id',
  [
    param('id').isMongoId().withMessage('Invalid user id'),
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('role').optional().isIn(['Admin', 'Manager', 'Staff']).withMessage('Invalid role'),
    body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
  ],
  validate,
  updateUser
);

router.delete('/:id', [param('id').isMongoId().withMessage('Invalid user id')], validate, deleteUser);

export default router;
