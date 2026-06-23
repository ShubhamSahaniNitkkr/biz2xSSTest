export const STANDARD_DEDUCTION = 50_000;
export const SECTION_80C_LIMIT = 150_000;
export const SECTION_80D_LIMIT = 25_000;

export const TAX_ASSUMPTIONS = [
  'Simplified new tax regime slabs for demonstration only.',
  'Not legal tax advice. Consult a tax professional.',
  'Standard deduction of ₹50,000 applied.',
  'Section 80C capped at ₹1,50,000.',
];

// Simplified new regime slabs (annual income in INR)
export const SLABS: { upto: number; rate: number }[] = [
  { upto: 300_000, rate: 0 },
  { upto: 700_000, rate: 0.05 },
  { upto: 1_000_000, rate: 0.1 },
  { upto: 1_200_000, rate: 0.15 },
  { upto: 1_500_000, rate: 0.2 },
  { upto: Infinity, rate: 0.3 },
];
