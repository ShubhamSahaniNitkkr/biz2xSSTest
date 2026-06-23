import type { PayrollMonth } from '../models/types.js';
import { getDb } from '../db/database.js';
import { v4 as uuid } from 'uuid';

function rowToPayroll(row: Record<string, unknown>): PayrollMonth {
  return JSON.parse(row.data_json as string) as PayrollMonth;
}

export function insertPayrollMonth(userId: string, data: PayrollMonth): void {
  getDb()
    .prepare(
      'INSERT OR REPLACE INTO payroll_months (id, user_id, month, data_json) VALUES (?, ?, ?, ?)',
    )
    .run(uuid(), userId, data.month, JSON.stringify(data));
}

export function listPayrollMonths(userId: string): PayrollMonth[] {
  const rows = getDb()
    .prepare('SELECT * FROM payroll_months WHERE user_id = ? ORDER BY month ASC')
    .all(userId) as Record<string, unknown>[];
  return rows.map(rowToPayroll);
}

export function findPayrollMonth(userId: string, month: string): PayrollMonth | null {
  const row = getDb()
    .prepare('SELECT * FROM payroll_months WHERE user_id = ? AND month = ?')
    .get(userId, month);
  return row ? rowToPayroll(row as Record<string, unknown>) : null;
}
