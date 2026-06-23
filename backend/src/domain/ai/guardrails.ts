import type { UserContext } from './contextBuilder.js';
import { hasAnyData } from './contextBuilder.js';

const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous\s+)?rules/i,
  /show\s+all\s+employees/i,
  /other\s+employees?'?\s+salary/i,
  /disregard\s+context/i,
];

export function detectPromptInjection(question: string): boolean {
  return INJECTION_PATTERNS.some((p) => p.test(question));
}

export function refuseIfNoData(ctx: UserContext): string | null {
  if (!hasAnyData(ctx)) {
    return 'I do not have your payslip or payroll data yet. Please upload a payslip or contact HR to load your records.';
  }
  return null;
}

export function refuseIfInjection(question: string): string | null {
  if (detectPromptInjection(question)) {
    return 'I can only answer questions about your own salary and tax data. I cannot access other employees\' information.';
  }
  return null;
}

export function buildMockAnswer(ctx: UserContext, question: string): string {
  const q = question.toLowerCase();
  const payslip = ctx.payslips[0];

  if (q.includes('hra') && payslip?.parsed.earnings.hra != null) {
    return `Based on your payslip, your HRA for ${payslip.parsed.month} is ₹${payslip.parsed.earnings.hra.toLocaleString('en-IN')}.`;
  }
  if ((q.includes('net') || q.includes('lower')) && payslip?.parsed.netPay != null) {
    return `Your net pay for ${payslip.parsed.month} is ₹${payslip.parsed.netPay.toLocaleString('en-IN')}. Deductions include PF, professional tax, and TDS as shown on your payslip.`;
  }
  if (q.includes('deduction') && payslip?.parsed.deductions.total != null) {
    return `Total deductions for ${payslip.parsed.month} are ₹${payslip.parsed.deductions.total.toLocaleString('en-IN')}, including PF (₹${payslip.parsed.deductions.pf ?? 0}), professional tax, and TDS.`;
  }
  return 'Based on your available payroll data, I can help explain salary components, deductions, and tax-saving options. Please ask a specific question about HRA, net pay, or deductions.';
}
