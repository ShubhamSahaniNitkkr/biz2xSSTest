import express from 'express';
import cors from 'cors';
import { loadEnv } from './config/env.js';
import { initDb } from './db/database.js';
import { requestId, errorHandler } from './middleware/errorHandler.js';
import { healthRouter } from './routes/health.js';
import { authRouter } from './routes/auth.js';
import { payslipsRouter } from './routes/payslips.js';
import { payrollRouter } from './routes/payroll.js';
import { taxRouter } from './routes/tax.js';
import { checklistRouter } from './routes/checklist.js';
import { chatRouter } from './routes/chat.js';
import { auditRouter } from './routes/audit.js';
import { AppError } from './utils/AppError.js';

export function createApp(): express.Application {
  loadEnv();
  try {
    getDb();
  } catch {
    initDb();
  }

  const env = loadEnv();

  const app = express();
  app.use(requestId);
  app.use(cors({ origin: env.CORS_ORIGIN }));
  app.use(express.json({ limit: '1mb' }));

  app.use(healthRouter);
  app.use('/auth', authRouter);
  app.use('/payslips', payslipsRouter);
  app.use('/payroll', payrollRouter);
  app.use('/tax', taxRouter);
  app.use('/checklist', checklistRouter);
  app.use('/chat', chatRouter);
  app.use('/audit', auditRouter);

  app.use((_req, _res, next) => {
    next(new AppError('NOT_FOUND', 'Route not found', 404));
  });

  app.use(errorHandler);
  return app;
}
