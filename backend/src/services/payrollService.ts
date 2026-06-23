import { listPayrollMonths, findPayrollMonth } from '../repositories/payrollRepo.js';
import { computeYtd } from '../domain/payroll/ytd.js';
import { compareMonths } from '../domain/payroll/compare.js';
import { AppError } from '../utils/AppError.js';

export function getPayrollMonths(userId: string) {
  return listPayrollMonths(userId);
}

export function getPayrollMonth(userId: string, month: string) {
  const data = findPayrollMonth(userId, month);
  if (!data) throw new AppError('NOT_FOUND', 'Payroll month not found', 404);
  return data;
}

export function getYtd(userId: string) {
  const months = listPayrollMonths(userId);
  return { months: months.length, ...computeYtd(months) };
}

export function comparePayrollMonths(userId: string, from: string, to: string) {
  const fromMonth = findPayrollMonth(userId, from);
  const toMonth = findPayrollMonth(userId, to);
  if (!fromMonth || !toMonth) {
    throw new AppError('NOT_FOUND', 'One or both payroll months not found', 404);
  }
  if (from === to) {
    return { fromMonth: from, toMonth: to, changes: [], message: 'Same month selected.' };
  }
  return compareMonths(fromMonth, toMonth);
}
