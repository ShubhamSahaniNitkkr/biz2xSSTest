import type { Payslip, PayslipData } from '../models/types.js';
import { getDb } from '../db/database.js';

function rowToPayslip(row: Record<string, unknown>): Payslip {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    fileName: row.file_name as string,
    uploadedAt: row.uploaded_at as string,
    parsed: JSON.parse(row.parsed_json as string) as PayslipData,
  };
}

export function insertPayslip(
  id: string,
  userId: string,
  fileName: string,
  parsed: PayslipData,
): Payslip {
  const uploadedAt = new Date().toISOString();
  getDb()
    .prepare(
      'INSERT INTO payslips (id, user_id, file_name, uploaded_at, parsed_json) VALUES (?, ?, ?, ?, ?)',
    )
    .run(id, userId, fileName, uploadedAt, JSON.stringify(parsed));

  return { id, userId, fileName, uploadedAt, parsed };
}

export function findPayslipById(id: string, userId: string): Payslip | null {
  const row = getDb()
    .prepare('SELECT * FROM payslips WHERE id = ? AND user_id = ?')
    .get(id, userId);
  return row ? rowToPayslip(row as Record<string, unknown>) : null;
}

export function findPayslipByIdUnsafe(id: string): Payslip | null {
  const row = getDb().prepare('SELECT * FROM payslips WHERE id = ?').get(id);
  return row ? rowToPayslip(row as Record<string, unknown>) : null;
}

export function listPayslipsByUser(userId: string): Payslip[] {
  const rows = getDb()
    .prepare('SELECT * FROM payslips WHERE user_id = ? ORDER BY uploaded_at DESC')
    .all(userId) as Record<string, unknown>[];
  return rows.map(rowToPayslip);
}
