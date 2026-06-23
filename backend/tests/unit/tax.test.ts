import { describe, it, expect } from 'vitest';
import { applySlabs, computeTaxableIncome, simulateExtra80C } from '../../src/domain/tax/calculator.js';
import { SECTION_80C_LIMIT } from '../../src/domain/tax/constants.js';

describe('tax calculator', () => {
  it('returns zero tax for income below first slab', () => {
    expect(applySlabs(200_000)).toBe(0);
  });

  it('computes taxable income with deductions', () => {
    const taxable = computeTaxableIncome(1_000_000, 100_000, 15_000);
    expect(taxable).toBe(835_000);
  });

  it('caps 80C at limit', () => {
    const taxable = computeTaxableIncome(1_000_000, 200_000, 0);
    const capped = computeTaxableIncome(1_000_000, SECTION_80C_LIMIT, 0);
    expect(taxable).toBe(capped);
  });

  it('simulates extra 80C savings', () => {
    const result = simulateExtra80C(1_116_000, 100_000, 15_000, 50_000);
    expect(result.annualTaxSaving).toBeGreaterThan(0);
    expect(result.monthlyTdsSaving).toBe(Math.round(result.annualTaxSaving / 12));
    expect(result.steps.length).toBeGreaterThan(0);
  });

  it('returns zero benefit when 80C already at cap', () => {
    const result = simulateExtra80C(1_116_000, SECTION_80C_LIMIT, 0, 50_000);
    expect(result.effectiveExtra80C).toBe(0);
    expect(result.annualTaxSaving).toBe(0);
  });

  it('golden fixture: known annual gross', () => {
    const result = simulateExtra80C(1_116_000, 100_000, 15_000, 0);
    expect(result.currentAnnualTax).toBe(applySlabs(computeTaxableIncome(1_116_000, 100_000, 15_000)));
  });
});
