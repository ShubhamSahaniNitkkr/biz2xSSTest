import { findDeclaration } from '../repositories/declarationRepo.js';
import { listPayslipsByUser } from '../repositories/payslipRepo.js';
import { buildChecklist } from '../domain/checklist/builder.js';
import { AppError } from '../utils/AppError.js';

export function getChecklist(userId: string) {
  const decl = findDeclaration(userId);
  if (!decl) throw new AppError('NOT_FOUND', 'Tax declaration not found', 404);

  const payslips = listPayslipsByUser(userId);
  const hasHra = payslips.some((p) => (p.parsed.earnings.hra ?? 0) > 0);

  return buildChecklist(decl, hasHra);
}
