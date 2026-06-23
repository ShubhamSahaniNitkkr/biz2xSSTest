import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { loadEnv } from '../config/env.js';

let db: Database.Database | null = null;

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  employee_id TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'employee',
  password TEXT NOT NULL DEFAULT 'demo123'
);

CREATE TABLE IF NOT EXISTS payslips (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  file_name TEXT NOT NULL,
  uploaded_at TEXT NOT NULL,
  parsed_json TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS payroll_months (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  month TEXT NOT NULL,
  data_json TEXT NOT NULL,
  UNIQUE(user_id, month),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS tax_declarations (
  user_id TEXT PRIMARY KEY,
  section_80c REAL NOT NULL DEFAULT 0,
  section_80d REAL NOT NULL DEFAULT 0,
  hra_declared REAL NOT NULL DEFAULT 0,
  proof_80c_submitted INTEGER NOT NULL DEFAULT 0,
  proof_80d_submitted INTEGER NOT NULL DEFAULT 0,
  proof_hra_submitted INTEGER NOT NULL DEFAULT 0,
  proof_deadline TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  action TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  metadata_json TEXT NOT NULL DEFAULT '{}',
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_payslips_user ON payslips(user_id);
CREATE INDEX IF NOT EXISTS idx_payroll_user ON payroll_months(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id);
`;

export function getDb(): Database.Database {
  if (!db) throw new Error('Database not initialized. Call initDb() first.');
  return db;
}

export function initDb(dbPath?: string): Database.Database {
  if (db) return db;

  const env = loadEnv();
  const resolved = dbPath ?? env.DB_PATH;
  const dir = path.dirname(resolved);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  db = new Database(resolved);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.exec(SCHEMA);
  migrateSchema(db);
  return db;
}

function migrateSchema(database: Database.Database): void {
  const columns = database.prepare('PRAGMA table_info(users)').all() as { name: string }[];
  if (!columns.some((c) => c.name === 'password')) {
    database.exec(`ALTER TABLE users ADD COLUMN password TEXT NOT NULL DEFAULT 'demo123'`);
  }
}

export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
  }
}

export function resetDbForTests(dbPath: string): Database.Database {
  closeDb();
  if (dbPath !== ':memory:') {
    for (const file of [dbPath, `${dbPath}-wal`, `${dbPath}-shm`]) {
      if (fs.existsSync(file)) {
        try {
          fs.unlinkSync(file);
        } catch {
          // Windows may lock files briefly; ignore
        }
      }
    }
  }
  return initDb(dbPath);
}
