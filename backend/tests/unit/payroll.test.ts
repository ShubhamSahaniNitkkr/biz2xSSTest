import { describe, it, expect } from 'vitest';
import { computeYtd, annualGrossFromPayroll } from '../../src/domain/payroll/ytd.js';
import { compareMonths } from '../../src/domain/payroll/compare.js';
import type { PayrollMonth } from '../../src/models/types.js';

const sampleMonths: PayrollMonth[] = [
  {
    month: '2025-03',
    earnings: { basic: 50000, hra: 20000, lta: 5000, specialAllowance: 15000, reimbursements: 2000, gross: 92000 },
    deductions: { pf: 6000, professionalTax: 200, tds: 7500, other: 0, total: 13700 },
    netPay: 78300,
    reimbursements: 2000,
  },
  {
    month: '2025-04',
    earnings: { basic: 50000, hra: 20000, lta: 5000, specialAllowance: 15000, reimbursements: 2500, gross: 92500 },
    deductions: { pf: 6000, professionalTax: 200, tds: 7800, other: 0, total: 14000 },
    netPay: 78500,
    reimbursements: 2500,
  },
];

describe('payroll ytd', () => {
  it('sums YTD values', () => {
    const ytd = computeYtd(sampleMonths);
    expect(ytd.netPay).toBe(78300 + 78500);
    expect(ytd.gross).toBe(92000 + 92500);
  });

  it('projects annual gross from partial year', () => {
    const annual = annualGrossFromPayroll(sampleMonths);
    expect(annual).toBe(Math.round(((92000 + 92500) / 2) * 12));
  });
});

describe('compare months', () => {
  it('detects net pay change', () => {
    const cmp = compareMonths(sampleMonths[0], sampleMonths[1]);
    expect(cmp.changes.some((c) => c.field === 'netPay' && c.delta === 200)).toBe(true);
  });
});
