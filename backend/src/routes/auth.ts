import { Router } from 'express';
import { login } from '../services/authService.js';
import { sendSuccess } from '../utils/response.js';
import { loginSchema } from '../validators/schemas.js';
import { loginLimiter } from '../middleware/rateLimit.js';
import { AppError } from '../utils/AppError.js';

export const authRouter = Router();

authRouter.post('/login', loginLimiter, (req, res, next) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError('VALIDATION_ERROR', parsed.error.errors[0]?.message ?? 'Invalid input', 400);
    }
    const result = login(parsed.data.email);
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
});
