import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { getDeclaration, runSimulation } from '../services/taxService.js';
import { sendSuccess } from '../utils/response.js';
import { simulateTaxSchema } from '../validators/schemas.js';
import { AppError } from '../utils/AppError.js';

export const taxRouter = Router();

taxRouter.use(authenticate);

taxRouter.get('/declaration', (req, res, next) => {
  try {
    sendSuccess(res, getDeclaration(req.auth!.userId));
  } catch (err) {
    next(err);
  }
});

taxRouter.post('/simulate', (req, res, next) => {
  try {
    const parsed = simulateTaxSchema.safeParse(req.body);
    if (!parsed.success) throw new AppError('VALIDATION_ERROR', parsed.error.errors[0]?.message ?? 'Invalid input', 400);
    sendSuccess(res, runSimulation(req.auth!.userId, parsed.data.extra80C));
  } catch (err) {
    next(err);
  }
});
