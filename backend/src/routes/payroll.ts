import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  getPayrollMonths,
  getPayrollMonth,
  getYtd,
  comparePayrollMonths,
} from '../services/payrollService.js';
import { sendSuccess } from '../utils/response.js';
import { monthParamSchema, compareMonthsSchema } from '../validators/schemas.js';
import { AppError } from '../utils/AppError.js';

export const payrollRouter = Router();

payrollRouter.use(authenticate);

payrollRouter.get('/months', (req, res, next) => {
  try {
    sendSuccess(res, getPayrollMonths(req.auth!.userId));
  } catch (err) {
    next(err);
  }
});

payrollRouter.get('/months/:month', (req, res, next) => {
  try {
    const month = monthParamSchema.safeParse(req.params.month);
    if (!month.success) throw new AppError('VALIDATION_ERROR', 'Invalid month format. Use YYYY-MM', 400);
    sendSuccess(res, getPayrollMonth(req.auth!.userId, month.data));
  } catch (err) {
    next(err);
  }
});

payrollRouter.get('/ytd', (req, res, next) => {
  try {
    sendSuccess(res, getYtd(req.auth!.userId));
  } catch (err) {
    next(err);
  }
});

payrollRouter.get('/compare', (req, res, next) => {
  try {
    const parsed = compareMonthsSchema.safeParse(req.query);
    if (!parsed.success) throw new AppError('VALIDATION_ERROR', 'Invalid compare query. Use from=YYYY-MM&to=YYYY-MM', 400);
    sendSuccess(res, comparePayrollMonths(req.auth!.userId, parsed.data.from, parsed.data.to));
  } catch (err) {
    next(err);
  }
});
