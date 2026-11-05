import { Router } from 'express';
import { getDashboard } from '../controllers/dashboardController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = Router();

// Clinic-wide figures (revenue, payroll, expenses) are for Admins only.
router.get('/', protect, authorize('Admin'), getDashboard);

export default router;
