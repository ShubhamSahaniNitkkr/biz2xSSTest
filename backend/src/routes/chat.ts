import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { askQuestion } from '../services/chatService.js';
import { sendSuccess } from '../utils/response.js';
import { chatAskSchema } from '../validators/schemas.js';
import { chatLimiter } from '../middleware/rateLimit.js';
import { AppError } from '../utils/AppError.js';

export const chatRouter = Router();

chatRouter.use(authenticate);

chatRouter.post('/ask', chatLimiter, async (req, res, next) => {
  try {
    const parsed = chatAskSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError('VALIDATION_ERROR', parsed.error.errors[0]?.message ?? 'Invalid input', 400);
    }
    // userId in body is intentionally ignored — only token userId is used (SEC-02)
    const result = await askQuestion(req.auth!.userId, parsed.data.question, parsed.data.userId);
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
});
