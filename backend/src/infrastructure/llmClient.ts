import { v4 as uuid } from 'uuid';
import { loadEnv } from '../config/env.js';
import { AppError } from '../utils/AppError.js';
import { logger } from '../utils/logger.js';

export interface LlmQueryInput {
  prompt: string;
  pdfBase64?: string;
  imageBase64?: string;
  imageMediaType?: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';
  metadata?: Record<string, string>;
}

export interface LlmClient {
  query(input: LlmQueryInput): Promise<string>;
}

export class HttpLlmClient implements LlmClient {
  async query(input: LlmQueryInput): Promise<string> {
    const env = loadEnv();
    const body: Record<string, unknown> = {
      prompt: input.prompt,
      metadata: { traceId: uuid(), ...input.metadata },
    };
    if (input.pdfBase64) body.pdfBase64 = input.pdfBase64;
    if (input.imageBase64) {
      body.imageBase64 = input.imageBase64;
      body.imageMediaType = input.imageMediaType ?? 'image/png';
    }

    const res = await fetch(`${env.LLM_API_URL}/llm/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.LLM_API_TOKEN}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      logger.error('LLM API error', { status: res.status });
      throw new AppError('SERVICE_UNAVAILABLE', 'AI service is temporarily unavailable', 503);
    }

    const data = (await res.json()) as { response?: string; text?: string; answer?: string };
    return data.response ?? data.text ?? data.answer ?? JSON.stringify(data);
  }
}

export class MockLlmClient implements LlmClient {
  async query(input: LlmQueryInput): Promise<string> {
    if (input.pdfBase64 || input.imageBase64) {
      return JSON.stringify({
        month: '2025-05',
        basic: 50000,
        hra: 20000,
        lta: 5000,
        specialAllowance: 15000,
        reimbursements: 3000,
        gross: 93000,
        pf: 6000,
        professionalTax: 200,
        tds: 8000,
        totalDeductions: 14200,
        netPay: 78800,
        ytdGross: 465000,
        ytdDeductions: 71000,
        ytdNetPay: 394000,
      });
    }

    const q = input.prompt.toLowerCase();
    if (q.includes('hra')) {
      return 'Based on your payslip data, your HRA is shown in the earnings section. I can only use the values provided in your payroll context.';
    }
    return 'Based on your available payroll data, here is a simple explanation using only the numbers in your records.';
  }
}

let client: LlmClient | null = null;

export function getLlmClient(): LlmClient {
  if (!client) {
    const env = loadEnv();
    client = env.USE_MOCK_LLM ? new MockLlmClient() : new HttpLlmClient();
  }
  return client;
}

export function setLlmClient(custom: LlmClient): void {
  client = custom;
}

export function resetLlmClient(): void {
  client = null;
}
