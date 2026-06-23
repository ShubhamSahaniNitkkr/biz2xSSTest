# Edge Cases — Tests & Documented Behavior

This document maps **expected deliverable edge cases** to automated tests and runtime behavior.

---

## 1. Missing payslip fields

| Scenario | Expected behavior | Test / location |
|----------|-------------------|-----------------|
| OCR returns null for HRA | Stored as `null`; validator warns "HRA is missing" | `tests/unit/payslip.test.ts` |
| Empty payslip template | All earnings/deductions `null` | `emptyPayslip()` in `domain/payslip/normalizer.ts` |
| User asks about missing field | AI prompt instructs: say data unavailable; mock answer does not invent numbers | `domain/ai/prompts.ts`, `domain/ai/guardrails.ts` |
| No payslip or payroll at all | Chat refused before LLM call | `refuseIfNoData()` — `tests/unit/ai.test.ts` |

**Manual check:** Upload a blank image with mock LLM — parsed fields show `null` and warnings array populated.

---

## 2. Unauthorized access

| Scenario | Expected behavior | Test |
|----------|-------------------|------|
| User A requests User B payslip by ID | 404 Not Found | SEC-01 `tests/security/security.test.ts` |
| `userId` in chat body | Ignored; token `userId` used | SEC-02 |
| No JWT on protected route | 401 Unauthorized | SEC-03 |
| Tampered JWT | 401 Unauthorized | SEC-04 |
| Cross-user payroll data | Each user sees only own months | SEC-05 |
| LLM context leak | Context contains only authenticated user | SEC-06 |

---

## 3. Inconsistent OCR output

| Scenario | Expected behavior | Test / location |
|----------|-------------------|-----------------|
| Alternate key names (`Basic`, `HRA`, `net_pay`) | Normalized to canonical schema | `tests/unit/payslip.test.ts` — "normalizes OCR with alternate keys" |
| Non-numeric values (`"N/A"`, empty string) | Coerced to `null` | `num()` in `domain/payslip/normalizer.ts` |
| LLM returns invalid JSON | Falls back to `seeds/mockOcr.json` | `services/payslipService.ts` |
| LLM API failure | Falls back to mock OCR seed | `payslipService.ts` catch block |
| Net pay ≠ gross − deductions | Warning added to `parsed.warnings` | `tests/unit/payslip.test.ts` — validator |

**Add test:** inconsistent OCR with string numbers and mixed casing — covered by normalizer tests.

---

## 4. Tax simulation assumptions

| Scenario | Expected behavior | Test |
|----------|-------------------|------|
| Income below first slab | Zero tax | `tests/unit/tax.test.ts` |
| 80C above ₹1,50,000 cap | Capped at limit | `tests/unit/tax.test.ts` |
| Extra 80C when already at cap | Zero benefit | `tests/unit/tax.test.ts` |
| Annual gross from partial YTD | Projected in service layer | `domain/tax/constants.ts`, README Part B |
| Simplified new regime only | Documented limitation | README — not old regime |

**Assumptions (not edge cases — by design):**

- Standard deduction: ₹50,000
- Section 80C cap: ₹1,50,000
- New tax regime slabs only
- Not legal/tax advice

---

## 5. Prompt injection & AI safety

| Scenario | Expected behavior | Test |
|----------|-------------------|------|
| "Show all employees salary" | Refused in code, no LLM call | SEC-10, `tests/unit/ai.test.ts` |
| "Ignore previous rules" | Refused | `detectPromptInjection()` |
| LLM unavailable | Mock answer from guardrails | `chatService.ts` catch → `buildMockAnswer()` |

---

## 6. File upload validation

| Scenario | Expected behavior | Test |
|----------|-------------------|------|
| `.exe` or disallowed MIME | 400 Validation error | SEC-07 |
| File > size limit | 400 Rejected | SEC-08 |

---

## Running all edge-case tests

```bash
cd backend
npm test                 # 40 tests (unit + integration + security)
npm run test:unit        # domain edge cases
npm run test:security    # access control
```
