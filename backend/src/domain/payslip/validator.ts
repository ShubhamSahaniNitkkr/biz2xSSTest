import type { PayslipData } from '../../models/types.js';

export function validatePayslipTotals(data: PayslipData): string[] {
  const warnings: string[] = [];
  const { earnings, deductions, netPay } = data;

  if (earnings.gross === null) warnings.push('Gross pay not found on payslip.');
  if (netPay === null) warnings.push('Net pay not found on payslip.');
  if (earnings.hra === null) warnings.push('HRA not found on payslip.');

  if (earnings.gross !== null && deductions.total !== null && netPay !== null) {
    const expected = earnings.gross - deductions.total;
    if (Math.abs(expected - netPay) > 1) {
      warnings.push(
        `Net pay (${netPay}) does not match gross (${earnings.gross}) minus deductions (${deductions.total}).`,
      );
    }
  }

  return warnings;
}
