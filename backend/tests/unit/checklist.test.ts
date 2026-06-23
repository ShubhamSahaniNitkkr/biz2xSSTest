import { describe, it, expect } from 'vitest';
import { buildChecklist } from '../../src/domain/checklist/builder.js';
import type { TaxDeclaration } from '../../src/models/types.js';

const baseDecl: TaxDeclaration = {
  userId: 'user-1',
  section80C: 100000,
  section80D: 15000,
  hraDeclared: 20000,
  proof80CSubmitted: false,
  proof80DSubmitted: true,
  proofHraSubmitted: false,
  proofDeadline: '2099-12-31',
};

describe('checklist builder', () => {
  it('includes pending 80C proof', () => {
    const items = buildChecklist(baseDecl, true);
    expect(items.some((i) => i.id === 'proof-80c')).toBe(true);
  });

  it('includes HRA proof when HRA in payslip', () => {
    const items = buildChecklist(baseDecl, true);
    expect(items.some((i) => i.id === 'proof-hra')).toBe(true);
  });

  it('shows all done when proofs submitted', () => {
    const items = buildChecklist(
      { ...baseDecl, proof80CSubmitted: true, proofHraSubmitted: true },
      false,
    );
    expect(items[0].id).toBe('all-done');
  });
});
