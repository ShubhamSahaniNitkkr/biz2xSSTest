import type { ChatSource, Payslip, PayrollMonth, TaxDeclaration } from '../../models/types.js';

export interface UserContext {
  userId: string;
  userName: string;
  payslips: Payslip[];
  payrollMonths: PayrollMonth[];
  declaration: TaxDeclaration | null;
}

export function buildGroundedContext(ctx: UserContext): Record<string, unknown> {
  return {
    employee: { id: ctx.userId, name: ctx.userName },
    payslips: ctx.payslips.map((p) => ({
      id: p.id,
      month: p.parsed.month,
      earnings: p.parsed.earnings,
      deductions: p.parsed.deductions,
      netPay: p.parsed.netPay,
      ytd: p.parsed.ytd,
    })),
    payrollMonths: ctx.payrollMonths,
    taxDeclaration: ctx.declaration,
  };
}

export function extractSourcesFromContext(
  ctx: UserContext,
  question: string,
): ChatSource[] {
  const sources: ChatSource[] = [];
  const q = question.toLowerCase();

  const latestPayslip = ctx.payslips[0];
  if (latestPayslip) {
    if (q.includes('hra')) {
      sources.push({
        field: 'HRA',
        value: latestPayslip.parsed.earnings.hra,
        source: 'payslip',
      });
    }
    if (q.includes('net') || q.includes('salary')) {
      sources.push({
        field: 'Net Pay',
        value: latestPayslip.parsed.netPay,
        source: 'payslip',
      });
    }
    if (q.includes('deduction')) {
      sources.push({
        field: 'Total Deductions',
        value: latestPayslip.parsed.deductions.total,
        source: 'payslip',
      });
    }
  }

  if (ctx.payrollMonths.length > 0 && (q.includes('ytd') || q.includes('year'))) {
    const latest = ctx.payrollMonths[ctx.payrollMonths.length - 1];
    sources.push({
      field: 'Latest month net pay',
      value: latest.netPay,
      source: 'payroll',
    });
  }

  return sources;
}

export function hasAnyData(ctx: UserContext): boolean {
  return ctx.payslips.length > 0 || ctx.payrollMonths.length > 0;
}

export function contextContainsOnlyUser(ctx: UserContext, userId: string): boolean {
  if (ctx.userId !== userId) return false;
  return ctx.payslips.every((p) => p.userId === userId);
}
