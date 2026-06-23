import type { MonthComparison, PayrollMonth } from '../../models/types.js';

const FIELDS = ['netPay', 'tds', 'pf', 'hra', 'gross'] as const;

function getFieldValue(month: PayrollMonth, field: string): number {
  switch (field) {
    case 'netPay':
      return month.netPay;
    case 'tds':
      return month.deductions.tds ?? 0;
    case 'pf':
      return month.deductions.pf ?? 0;
    case 'hra':
      return month.earnings.hra ?? 0;
    case 'gross':
      return month.earnings.gross ?? 0;
    default:
      return 0;
  }
}

export function compareMonths(
  from: PayrollMonth,
  to: PayrollMonth,
): MonthComparison {
  const changes = FIELDS.map((field) => {
    const fromVal = getFieldValue(from, field);
    const toVal = getFieldValue(to, field);
    return { field, from: fromVal, to: toVal, delta: toVal - fromVal };
  }).filter((c) => c.delta !== 0);

  return { fromMonth: from.month, toMonth: to.month, changes };
}
