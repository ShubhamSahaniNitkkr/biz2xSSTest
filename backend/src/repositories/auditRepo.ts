import type { AuditEntry } from '../models/types.js';
import { getDb } from '../db/database.js';
import { v4 as uuid } from 'uuid';

export function insertAudit(
  userId: string,
  action: string,
  metadata: Record<string, unknown> = {},
): AuditEntry {
  const entry: AuditEntry = {
    id: uuid(),
    userId,
    action,
    timestamp: new Date().toISOString(),
    metadata,
  };

  getDb()
    .prepare(
      'INSERT INTO audit_logs (id, user_id, action, timestamp, metadata_json) VALUES (?, ?, ?, ?, ?)',
    )
    .run(entry.id, entry.userId, entry.action, entry.timestamp, JSON.stringify(entry.metadata));

  return entry;
}

export function listAuditLogs(limit = 50): AuditEntry[] {
  const rows = getDb()
    .prepare('SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT ?')
    .all(limit) as Record<string, unknown>[];

  return rows.map((row) => ({
    id: row.id as string,
    userId: row.user_id as string,
    action: row.action as string,
    timestamp: row.timestamp as string,
    metadata: JSON.parse(row.metadata_json as string) as Record<string, unknown>,
  }));
}
