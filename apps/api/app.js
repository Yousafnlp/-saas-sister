import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import crypto from 'crypto';
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';

import { connectDB } from './config/db.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import employeeRoutes from './routes/employeeRoutes.js';
import expenseRoutes from './routes/expenseRoutes.js';
import payrollRoutes from './routes/payrollRoutes.js';
import leadRoutes from './routes/leadRoutes.js';
import clientRoutes from './routes/clientRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import billRoutes from './routes/billRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import branchRoutes from './routes/branchRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import inviteRoutes from './routes/inviteRoutes.js';
import roleRoutes from './routes/roleRoutes.js';
import publicRoutes from './routes/publicRoutes.js';

const app = express();

// Required for correct client IPs (and rate limiting) behind a PaaS load balancer/proxy.
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

const allowedOrigins = (process.env.CORS_ORIGIN || '').split(',').map((o) => o.trim()).filter(Boolean);

app.use(helmet());
app.use(
  cors({
    origin: allowedOrigins.length > 0 ? allowedOrigins : true,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// Signed-in staff are counted per session rather than per IP: everyone on the clinic's Wi-Fi shares
// one public IP, so a per-IP limit would throttle the whole clinic at once. Anonymous traffic,
// including the public booking pages, is still counted per IP.
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const auth = req.headers.authorization;
    if (auth?.startsWith('Bearer ') && !req.path.startsWith('/public')) {
      return `session:${crypto.createHash('sha256').update(auth).digest('hex')}`;
    }
    return ipKeyGenerator(req.ip);
  },
});

app.use('/api', apiLimiter);

app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'API is healthy', timestamp: new Date().toISOString() });
});

// Serverless functions have no persistent process, so the DB connection is
// established (and cached) lazily on first use rather than at module load.
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    next(err);
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/bills', billRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/invites', inviteRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/public', publicRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
