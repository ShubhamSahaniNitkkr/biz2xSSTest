export type UserRole = 'employee' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  employeeId: string;
  role: UserRole;
}

export interface PayslipEarnings {
  basic: number | null;
  hra: number | null;
  lta: number | null;
  specialAllowance: number | null;
  reimbursements: number | null;
  gross: number | null;
}

export interface PayslipDeductions {
  pf: number | null;
  professionalTax: number | null;
  tds: number | null;
  other: number | null;
  total: number | null;
}

export interface PayslipYtd {
  gross: number | null;
  deductions: number | null;
  netPay: number | null;
}

export interface PayslipData {
  month: string;
  earnings: PayslipEarnings;
  deductions: PayslipDeductions;
  netPay: number | null;
  ytd: PayslipYtd;
  warnings?: string[];
}

export interface Payslip {
  id: string;
  userId: string;
  fileName: string;
  uploadedAt: string;
  parsed: PayslipData;
}

export interface PayrollMonth {
  month: string;
  earnings: PayslipEarnings;
  deductions: PayslipDeductions;
  netPay: number;
  reimbursements: number;
}

export interface TaxDeclaration {
  userId: string;
  section80C: number;
  section80D: number;
  hraDeclared: number;
  proof80CSubmitted: boolean;
  proof80DSubmitted: boolean;
  proofHraSubmitted: boolean;
  proofDeadline?: string;
}

export interface TaxSimulationInput {
  extra80C: number;
}

export interface TaxSimulationResult {
  currentAnnualTax: number;
  newAnnualTax: number;
  annualTaxSaving: number;
  monthlyTdsSaving: number;
  assumptions: string[];
  steps: { label: string; value: number; note: string }[];
}

export interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  status: 'required' | 'optional' | 'overdue';
  documentType: string;
}

export interface ChatSource {
  field: string;
  value: string | number | null;
  source: 'payslip' | 'payroll' | 'declaration';
}

export interface ChatResponse {
  answer: string;
  sources: ChatSource[];
  refused: boolean;
}

export interface AuditEntry {
  id: string;
  userId: string;
  action: string;
  timestamp: string;
  metadata: Record<string, unknown>;
}

export interface MonthComparison {
  fromMonth: string;
  toMonth: string;
  changes: { field: string; from: number; to: number; delta: number }[];
}
