import { SLABS, STANDARD_DEDUCTION, SECTION_80C_LIMIT, SECTION_80D_LIMIT } from './constants.js';

export function applySlabs(taxableIncome: number): number {
  if (taxableIncome <= 0) return 0;

  let tax = 0;
  let prev = 0;

  for (const slab of SLABS) {
    const band = Math.min(taxableIncome, slab.upto) - prev;
    if (band > 0) tax += band * slab.rate;
    prev = slab.upto;
    if (taxableIncome <= slab.upto) break;
  }

  return Math.round(tax);
}

export function computeTaxableIncome(
  annualGross: number,
  declared80C: number,
  declared80D: number,
): number {
  const capped80C = Math.min(declared80C, SECTION_80C_LIMIT);
  const capped80D = Math.min(declared80D, SECTION_80D_LIMIT);
  return Math.max(0, annualGross - STANDARD_DEDUCTION - capped80C - capped80D);
}

export function simulateExtra80C(
  annualGross: number,
  current80C: number,
  current80D: number,
  extra80C: number,
): {
  currentAnnualTax: number;
  newAnnualTax: number;
  annualTaxSaving: number;
  monthlyTdsSaving: number;
  effectiveExtra80C: number;
  steps: { label: string; value: number; note: string }[];
} {
  const currentTaxable = computeTaxableIncome(annualGross, current80C, current80D);
  const currentAnnualTax = applySlabs(currentTaxable);

  const roomUnderCap = Math.max(0, SECTION_80C_LIMIT - current80C);
  const effectiveExtra80C = Math.min(extra80C, roomUnderCap);
  const new80C = current80C + effectiveExtra80C;

  const newTaxable = computeTaxableIncome(annualGross, new80C, current80D);
  const newAnnualTax = applySlabs(newTaxable);
  const annualTaxSaving = currentAnnualTax - newAnnualTax;

  const steps = [
    { label: 'Annual gross salary', value: annualGross, note: 'From payroll YTD' },
    { label: 'Standard deduction', value: STANDARD_DEDUCTION, note: 'Fixed assumption' },
    { label: 'Current 80C declared', value: current80C, note: `Cap ₹${SECTION_80C_LIMIT}` },
    { label: 'Additional 80C applied', value: effectiveExtra80C, note: 'Capped by remaining room' },
    { label: 'Taxable income (before)', value: currentTaxable, note: 'After deductions' },
    { label: 'Taxable income (after)', value: newTaxable, note: 'After extra 80C' },
    { label: 'Annual tax (before)', value: currentAnnualTax, note: 'Simplified slabs' },
    { label: 'Annual tax (after)', value: newAnnualTax, note: 'Simplified slabs' },
  ];

  return {
    currentAnnualTax,
    newAnnualTax,
    annualTaxSaving,
    monthlyTdsSaving: Math.round(annualTaxSaving / 12),
    effectiveExtra80C,
    steps,
  };
}
