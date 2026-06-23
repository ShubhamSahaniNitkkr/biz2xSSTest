import { findDeclaration } from '../repositories/declarationRepo.js';
import { listPayrollMonths } from '../repositories/payrollRepo.js';
import { annualGrossFromPayroll } from '../domain/payroll/ytd.js';
import { simulateExtra80C } from '../domain/tax/calculator.js';
import { TAX_ASSUMPTIONS } from '../domain/tax/constants.js';
import { AppError } from '../utils/AppError.js';

export function getDeclaration(userId: string) {
  const decl = findDeclaration(userId);
  if (!decl) throw new AppError('NOT_FOUND', 'Tax declaration not found', 404);
  return decl;
}

export function runSimulation(userId: string, extra80C: number) {
  const decl = findDeclaration(userId);
  if (!decl) throw new AppError('NOT_FOUND', 'Tax declaration not found', 404);

  const months = listPayrollMonths(userId);
  const annualGross = annualGrossFromPayroll(months);

  const result = simulateExtra80C(annualGross, decl.section80C, decl.section80D, extra80C);

  return {
    currentAnnualTax: result.currentAnnualTax,
    newAnnualTax: result.newAnnualTax,
    annualTaxSaving: result.annualTaxSaving,
    monthlyTdsSaving: result.monthlyTdsSaving,
    assumptions: TAX_ASSUMPTIONS,
    steps: result.steps,
    note:
      result.effectiveExtra80C < extra80C
        ? 'Additional 80C capped at remaining limit under ₹1,50,000.'
        : undefined,
  };
}
