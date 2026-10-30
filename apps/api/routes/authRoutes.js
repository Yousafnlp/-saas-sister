import { Router } from 'express';
import { body, param } from 'express-validator';
import rateLimit from 'express-rate-limit';
import { login, getMe } from '../controllers/authController.js';
import { getInviteByToken, acceptInvite } from '../controllers/inviteController.js';
import { protect } from '../middleware/authMiddleware.js';
import validate, { validatePublic } from '../middleware/validate.js';

const router = Router();

// New accounts are created only through invites (see /invites/:token/accept below).

// Brute-force protection for the endpoints that check a password or an invite token. Only failed
// attempts count, so a clinic full of staff signing in from one Wi-Fi never trips it.
// GET /me is deliberately not limited here: the dashboard calls it on every page load.
const credentialLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { message: 'Too many attempts. Please try again in 15 minutes.' } },
});

const tokenParam = param('token', 'This invite link is not valid. Ask your admin for a new one.')
  .isHexadecimal()
  .isLength({ min: 64, max: 64 });

router.post(
  '/login',
  credentialLimiter,
  [
    body('email').isEmail().withMessage('A valid email is required').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  login
);

router.get('/me', protect, getMe);

router.get('/invites/:token', credentialLimiter, [tokenParam], validatePublic, getInviteByToken);
router.post(
  '/invites/:token/accept',
  credentialLimiter,
  [
    tokenParam,
    body('name').trim().notEmpty().withMessage('Please enter your name').isLength({ max: 100 }).withMessage('Name is too long'),
    body('password').isLength({ min: 6, max: 72 }).withMessage('Password must be 6 to 72 characters'),
  ],
  validatePublic,
  acceptInvite
);

export default router;
