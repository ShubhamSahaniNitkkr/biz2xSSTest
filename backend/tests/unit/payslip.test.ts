import { describe, it, expect } from 'vitest';
import { normalizeOcr, emptyPayslip } from '../../src/domain/payslip/normalizer.js';
import { validatePayslipTotals } from '../../src/domain/payslip/validator.js';

describe('payslip normalizer', () => {
  it('normalizes OCR with alternate keys', () => {
    const data = normalizeOcr({ Basic: 50000, HRA: 20000, grossPay: 93000, net_pay: 78800 });
    expect(data.earnings.basic).toBe(50000);
    expect(data.earnings.hra).toBe(20000);
    expect(data.netPay).toBe(78800);
  });

  it('returns null for missing fields', () => {
    const data = emptyPayslip('2025-01');
    expect(data.earnings.hra).toBeNull();
  });

  it('handles inconsistent OCR: strings, N/A, and mixed keys', () => {
    const data = normalizeOcr({
      Basic: '50000',
      HRA: 'N/A',
      grossPay: 'not-a-number',
      net_pay: '',
      month: '2025-06',
    });
    expect(data.earnings.basic).toBe(50000);
    expect(data.earnings.hra).toBeNull();
    expect(data.earnings.gross).toBeNull();
    expect(data.netPay).toBeNull();
    expect(data.month).toBe('2025-06');
  });
});

describe('payslip validator', () => {
  it('warns when net does not match gross minus deductions', () => {
    const data = normalizeOcr({ gross: 100000, totalDeductions: 20000, netPay: 70000 });
    const warnings = validatePayslipTotals(data);
    expect(warnings.some((w) => w.includes('does not match'))).toBe(true);
  });

  it('warns when HRA missing', () => {
    const data = normalizeOcr({ gross: 100000, totalDeductions: 20000, netPay: 80000 });
    const warnings = validatePayslipTotals(data);
    expect(warnings.some((w) => w.includes('HRA'))).toBe(true);
  });
});
