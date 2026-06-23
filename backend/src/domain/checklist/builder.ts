import type { ChecklistItem, TaxDeclaration } from '../../models/types.js';

export function buildChecklist(
  declaration: TaxDeclaration,
  hasHraInPayslip: boolean,
): ChecklistItem[] {
  const items: ChecklistItem[] = [];
  const now = new Date();

  if (declaration.section80C > 0 && !declaration.proof80CSubmitted) {
    items.push({
      id: 'proof-80c',
      title: 'Submit Section 80C investment proof',
      description: `Declared ₹${declaration.section80C.toLocaleString('en-IN')}. Upload ELSS, PPF, or LIC statements.`,
      status: isOverdue(declaration.proofDeadline, now) ? 'overdue' : 'required',
      documentType: '80C_investment_proof',
    });
  }

  if (declaration.section80D > 0 && !declaration.proof80DSubmitted) {
    items.push({
      id: 'proof-80d',
      title: 'Submit Section 80D health insurance proof',
      description: `Declared ₹${declaration.section80D.toLocaleString('en-IN')}. Upload policy premium receipt.`,
      status: isOverdue(declaration.proofDeadline, now) ? 'overdue' : 'required',
      documentType: '80D_insurance_proof',
    });
  }

  if (
    (declaration.hraDeclared > 0 || hasHraInPayslip) &&
    !declaration.proofHraSubmitted
  ) {
    items.push({
      id: 'proof-hra',
      title: 'Submit HRA rent receipts',
      description: 'Rent receipts and landlord PAN required for HRA exemption.',
      status: isOverdue(declaration.proofDeadline, now) ? 'overdue' : 'required',
      documentType: 'HRA_rent_receipts',
    });
  }

  if (items.length === 0) {
    items.push({
      id: 'all-done',
      title: 'All proofs submitted',
      description: 'No pending investment or payroll documents at this time.',
      status: 'optional',
      documentType: 'none',
    });
  }

  return items;
}

function isOverdue(deadline: string | undefined, now: Date): boolean {
  if (!deadline) return false;
  return new Date(deadline) < now;
}
