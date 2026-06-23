import employees from '../../seeds/employees.json' with { type: 'json' };
import payroll from '../../seeds/payroll.json' with { type: 'json' };
import declarations from '../../seeds/declarations.json' with { type: 'json' };
import { initDb, getDb } from './database.js';
import { insertUser } from '../repositories/userRepo.js';
import { insertPayrollMonth } from '../repositories/payrollRepo.js';
import { upsertDeclaration } from '../repositories/declarationRepo.js';
import type { User, PayrollMonth, TaxDeclaration } from '../models/types.js';
import { loadEnv } from '../config/env.js';

export function runSeed(): void {
  try {
    getDb();
  } catch {
    initDb();
  }

  for (const emp of employees as User[]) {
    const exists = getDb().prepare('SELECT id FROM users WHERE email = ?').get(emp.email);
    if (!exists) insertUser(emp);
  }

  const payrollData = payroll as Record<string, PayrollMonth[]>;
  for (const [userId, months] of Object.entries(payrollData)) {
    for (const month of months) {
      insertPayrollMonth(userId, month);
    }
  }

  const declData = declarations as Record<string, TaxDeclaration>;
  for (const decl of Object.values(declData)) {
    upsertDeclaration(decl);
  }
}

const isSeedScript = process.argv[1]?.replace(/\\/g, '/').includes('seed');
if (isSeedScript) {
  loadEnv();
  runSeed();
  console.log('Seed completed successfully.');
}
