import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { getAuditLogs } from '../services/auditService.js';
import { sendSuccess } from '../utils/response.js';

export const auditRouter = Router();

auditRouter.use(authenticate, authorize('admin'));

auditRouter.get('/', (_req, res, next) => {
  try {
    sendSuccess(res, getAuditLogs());
  } catch (err) {
    next(err);
  }
});
