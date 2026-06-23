import { listAuditLogs } from '../repositories/auditRepo.js';

export function getAuditLogs() {
  return listAuditLogs(100).map((entry) => ({
    id: entry.id,
    userId: entry.userId,
    action: entry.action,
    timestamp: entry.timestamp,
    metadata: entry.metadata,
  }));
}
