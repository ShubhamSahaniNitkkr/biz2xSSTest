import { findUserById } from '../repositories/userRepo.js';
import { listPayslipsByUser } from '../repositories/payslipRepo.js';
import { listPayrollMonths } from '../repositories/payrollRepo.js';
import { findDeclaration } from '../repositories/declarationRepo.js';
import { insertAudit } from '../repositories/auditRepo.js';
import {
  buildGroundedContext,
  extractSourcesFromContext,
  hasAnyData,
  type UserContext,
} from '../domain/ai/contextBuilder.js';
import {
  refuseIfInjection,
  refuseIfNoData,
  buildMockAnswer,
} from '../domain/ai/guardrails.js';
import { GROUNDED_CHAT_PROMPT } from '../domain/ai/prompts.js';
import { getLlmClient } from '../infrastructure/llmClient.js';
import type { ChatResponse } from '../models/types.js';

export function buildUserContext(userId: string): UserContext {
  const user = findUserById(userId);
  return {
    userId,
    userName: user?.name ?? 'Employee',
    payslips: listPayslipsByUser(userId),
    payrollMonths: listPayrollMonths(userId),
    declaration: findDeclaration(userId),
  };
}

export async function askQuestion(
  userId: string,
  question: string,
  _ignoredUserId?: string,
): Promise<ChatResponse> {
  const ctx = buildUserContext(userId);

  const injectionRefusal = refuseIfInjection(question);
  if (injectionRefusal) {
    return { answer: injectionRefusal, sources: [], refused: true };
  }

  const noDataRefusal = refuseIfNoData(ctx);
  if (noDataRefusal) {
    return { answer: noDataRefusal, sources: [], refused: true };
  }

  const contextJson = JSON.stringify(buildGroundedContext(ctx), null, 2);
  const prompt = `${GROUNDED_CHAT_PROMPT}${contextJson}\n\nUSER QUESTION:\n${question}`;

  let answer: string;
  const llm = getLlmClient();
  try {
    answer = await llm.query({ prompt, metadata: { userId } });
  } catch {
    answer = buildMockAnswer(ctx, question);
  }

  const sources = extractSourcesFromContext(ctx, question);
  insertAudit(userId, 'chat_query', { questionLength: question.length });

  return { answer, sources, refused: false };
}

export { hasAnyData, buildGroundedContext };
