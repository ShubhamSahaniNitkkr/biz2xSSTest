import { Router } from 'express';
import { sendSuccess } from '../utils/response.js';
import { getDb } from '../db/database.js';

export const healthRouter = Router();

healthRouter.get('/health', (_req, res) => {
  try {
    getDb().prepare('SELECT 1').get();
    sendSuccess(res, { status: 'ok', db: 'connected' });
  } catch {
    sendSuccess(res, { status: 'ok', db: 'disconnected' });
  }
});
