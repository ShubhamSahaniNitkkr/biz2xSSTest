import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email(),
});

export const simulateTaxSchema = z.object({
  extra80C: z.number().min(0).max(1_500_000),
});

export const chatAskSchema = z.object({
  question: z.string().min(1).max(2000),
  payslipId: z.string().uuid().optional(),
  month: z.string().regex(/^\d{4}-\d{2}$/).optional(),
  userId: z.string().optional(), // ignored — security test verifies this
});

export const compareMonthsSchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}$/),
  to: z.string().regex(/^\d{4}-\d{2}$/),
});

export const monthParamSchema = z.string().regex(/^\d{4}-\d{2}$/);
