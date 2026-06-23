import type { User, UserRole } from '../models/types.js';
import { getDb } from '../db/database.js';

function rowToUser(row: Record<string, unknown>): User {
  return {
    id: row.id as string,
    email: row.email as string,
    name: row.name as string,
    employeeId: row.employee_id as string,
    role: row.role as UserRole,
  };
}

export function findUserByEmail(email: string): User | null {
  const row = getDb().prepare('SELECT * FROM users WHERE email = ?').get(email);
  return row ? rowToUser(row as Record<string, unknown>) : null;
}

export function findUserById(id: string): User | null {
  const row = getDb().prepare('SELECT * FROM users WHERE id = ?').get(id);
  return row ? rowToUser(row as Record<string, unknown>) : null;
}

export function insertUser(user: User): void {
  getDb()
    .prepare(
      'INSERT INTO users (id, email, name, employee_id, role) VALUES (?, ?, ?, ?, ?)',
    )
    .run(user.id, user.email, user.name, user.employeeId, user.role);
}

export function listUsers(): User[] {
  const rows = getDb().prepare('SELECT * FROM users').all() as Record<string, unknown>[];
  return rows.map(rowToUser);
}
