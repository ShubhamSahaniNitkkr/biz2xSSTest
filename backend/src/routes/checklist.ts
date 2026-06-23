import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { getChecklist } from '../services/checklistService.js';
import { sendSuccess } from '../utils/response.js';

export const checklistRouter = Router();

checklistRouter.use(authenticate);

checklistRouter.get('/', (req, res, next) => {
  try {
    sendSuccess(res, getChecklist(req.auth!.userId));
  } catch (err) {
    next(err);
  }
});
