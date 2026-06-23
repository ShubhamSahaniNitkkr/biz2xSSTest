import path from 'path';
import { fileURLToPath } from 'url';
import { resetEnvCache } from '../src/config/env.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-min-8-chars';
process.env.LLM_API_URL = 'https://llm-wrapper-741152993481.asia-south1.run.app';
process.env.LLM_API_TOKEN = 'test-token';
process.env.USE_MOCK_LLM = 'true';
process.env.DB_PATH = ':memory:';
process.env.CORS_ORIGIN = 'http://localhost:5173';
process.env.UPLOAD_DIR = path.join(__dirname, 'tmp', 'uploads');

resetEnvCache();
