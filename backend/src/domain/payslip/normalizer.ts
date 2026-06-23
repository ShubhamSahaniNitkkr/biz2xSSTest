import type { PayslipData } from '../../models/types.js';

function num(v: unknown): number | null {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export function normalizeOcr(raw: Record<string, unknown>): PayslipData {
  const earnings = {
    basic: num(raw.basic ?? raw.Basic),
    hra: num(raw.hra ?? raw.HRA),
    lta: num(raw.lta ?? raw.LTA),
    specialAllowance: num(raw.specialAllowance ?? raw.special_allowance),
    reimbursements: num(raw.reimbursements),
    gross: num(raw.gross ?? raw.grossPay),
  };

  const deductions = {
    pf: num(raw.pf ?? raw.PF),
    professionalTax: num(raw.professionalTax ?? raw.professional_tax),
    tds: num(raw.tds ?? raw.TDS),
    other: num(raw.otherDeductions ?? raw.other),
    total: num(raw.totalDeductions ?? raw.deductions),
  };

  const netPay = num(raw.netPay ?? raw.net_pay);
  const month = String(raw.month ?? raw.payPeriod ?? 'unknown');

  const ytd = {
    gross: num(raw.ytdGross ?? raw.ytd_gross),
    deductions: num(raw.ytdDeductions ?? raw.ytd_deductions),
    netPay: num(raw.ytdNetPay ?? raw.ytd_net_pay),
  };

  return { month, earnings, deductions, netPay, ytd };
}

export function emptyPayslip(month = 'unknown'): PayslipData {
  const nullEarnings = {
    basic: null,
    hra: null,
    lta: null,
    specialAllowance: null,
    reimbursements: null,
    gross: null,
  };
  return {
    month,
    earnings: nullEarnings,
    deductions: { pf: null, professionalTax: null, tds: null, other: null, total: null },
    netPay: null,
    ytd: { gross: null, deductions: null, netPay: null },
  };
}
