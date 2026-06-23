import type { PayrollMonth } from '../../models/types.js';

export function computeYtd(months: PayrollMonth[]): {
  gross: number;
  deductions: number;
  netPay: number;
  reimbursements: number;
} {
  return months.reduce(
    (acc, m) => ({
      gross: acc.gross + (m.earnings.gross ?? 0),
      deductions: acc.deductions + (m.deductions.total ?? 0),
      netPay: acc.netPay + m.netPay,
      reimbursements: acc.reimbursements + m.reimbursements,
    }),
    { gross: 0, deductions: 0, netPay: 0, reimbursements: 0 },
  );
}

export function annualGrossFromPayroll(months: PayrollMonth[]): number {
  const ytd = computeYtd(months);
  if (months.length >= 12) return ytd.gross;
  // Project annual from average if fewer than 12 months
  const avg = ytd.gross / Math.max(months.length, 1);
  return Math.round(avg * 12);
}
