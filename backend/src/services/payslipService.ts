import { v4 as uuid } from 'uuid';
import { normalizeOcr } from '../domain/payslip/normalizer.js';
import { validatePayslipTotals } from '../domain/payslip/validator.js';
import { insertPayslip, findPayslipById, listPayslipsByUser } from '../repositories/payslipRepo.js';
import { insertAudit } from '../repositories/auditRepo.js';
import { getLlmClient } from '../infrastructure/llmClient.js';
import { saveUpload } from '../infrastructure/fileStorage.js';
import { OCR_EXTRACTION_PROMPT } from '../domain/ai/prompts.js';
import { AppError } from '../utils/AppError.js';
import mockOcr from '../../seeds/mockOcr.json' with { type: 'json' };

const ALLOWED_MIME = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
]);

export async function uploadPayslip(
  userId: string,
  fileName: string,
  mimeType: string,
  buffer: Buffer,
) {
  if (!ALLOWED_MIME.has(mimeType)) {
    throw new AppError('VALIDATION_ERROR', 'Only PDF and image files are allowed', 400);
  }

  saveUpload(fileName, buffer);

  let raw: Record<string, unknown>;
  try {
    const llm = getLlmClient();
    const base64 = buffer.toString('base64');
    const isPdf = mimeType === 'application/pdf';
    const response = await llm.query(
      isPdf
        ? { prompt: OCR_EXTRACTION_PROMPT, pdfBase64: base64 }
        : {
            prompt: OCR_EXTRACTION_PROMPT,
            imageBase64: base64,
            imageMediaType: mimeType === 'image/jpeg' || mimeType === 'image/jpg' ? 'image/jpeg' : 'image/png',
          },
    );

    const jsonMatch = response.match(/\{[\s\S]*\}/);
    raw = jsonMatch ? (JSON.parse(jsonMatch[0]) as Record<string, unknown>) : (mockOcr as Record<string, unknown>);
  } catch {
    raw = mockOcr as Record<string, unknown>;
  }

  const parsed = normalizeOcr(raw);
  parsed.warnings = validatePayslipTotals(parsed);

  const payslip = insertPayslip(uuid(), userId, fileName, parsed);
  insertAudit(userId, 'payslip_uploaded', { payslipId: payslip.id, fileName });

  return payslip;
}

export function getPayslip(userId: string, payslipId: string) {
  const payslip = findPayslipById(payslipId, userId);
  if (!payslip) throw new AppError('NOT_FOUND', 'Payslip not found', 404);
  insertAudit(userId, 'payslip_viewed', { payslipId });
  return payslip;
}

export function listPayslips(userId: string) {
  return listPayslipsByUser(userId);
}
