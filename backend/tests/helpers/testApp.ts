import { resetEnvCache } from '../../src/config/env.js';
import { resetDbForTests, closeDb } from '../../src/db/database.js';
import { runSeed } from '../../src/db/seed.js';
import { resetLlmClient, setLlmClient, MockLlmClient } from '../../src/infrastructure/llmClient.js';
import { createApp } from '../../src/app.js';
import { login } from '../../src/services/authService.js';

export function setupTestEnv(): void {
  resetEnvCache();
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-secret-key-min-8-chars';
  process.env.LLM_API_URL = 'https://llm-wrapper-741152993481.asia-south1.run.app';
  process.env.LLM_API_TOKEN = 'test-token';
  process.env.USE_MOCK_LLM = 'true';
  process.env.DB_PATH = ':memory:';
  resetEnvCache();

  resetDbForTests(':memory:');
  runSeed();
  resetLlmClient();
  setLlmClient(new MockLlmClient());
}

export function teardownTestEnv(): void {
  closeDb();
}

export function getTestApp() {
  setupTestEnv();
  return createApp();
}

export function getToken(email: string): string {
  return login(email).token;
}

export const USER1_EMAIL = 'employee1@company.com';
export const USER2_EMAIL = 'employee2@company.com';
export const ADMIN_EMAIL = 'admin@company.com';
