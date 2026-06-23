import type { TaxDeclaration } from '../models/types.js';
import { getDb } from '../db/database.js';

function rowToDeclaration(row: Record<string, unknown>): TaxDeclaration {
  return {
    userId: row.user_id as string,
    section80C: row.section_80c as number,
    section80D: row.section_80d as number,
    hraDeclared: row.hra_declared as number,
    proof80CSubmitted: Boolean(row.proof_80c_submitted),
    proof80DSubmitted: Boolean(row.proof_80d_submitted),
    proofHraSubmitted: Boolean(row.proof_hra_submitted),
    proofDeadline: (row.proof_deadline as string) || undefined,
  };
}

export function upsertDeclaration(decl: TaxDeclaration): void {
  getDb()
    .prepare(
      `INSERT OR REPLACE INTO tax_declarations
       (user_id, section_80c, section_80d, hra_declared, proof_80c_submitted, proof_80d_submitted, proof_hra_submitted, proof_deadline)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      decl.userId,
      decl.section80C,
      decl.section80D,
      decl.hraDeclared,
      decl.proof80CSubmitted ? 1 : 0,
      decl.proof80DSubmitted ? 1 : 0,
      decl.proofHraSubmitted ? 1 : 0,
      decl.proofDeadline ?? null,
    );
}

export function findDeclaration(userId: string): TaxDeclaration | null {
  const row = getDb()
    .prepare('SELECT * FROM tax_declarations WHERE user_id = ?')
    .get(userId);
  return row ? rowToDeclaration(row as Record<string, unknown>) : null;
}
