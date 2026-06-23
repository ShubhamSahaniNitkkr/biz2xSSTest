import fs from 'fs';
import path from 'path';
import { loadEnv } from '../config/env.js';

export function ensureUploadDir(): string {
  const env = loadEnv();
  const dir = path.resolve(env.UPLOAD_DIR);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export function saveUpload(fileName: string, buffer: Buffer): string {
  const dir = ensureUploadDir();
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const filePath = path.join(dir, `${Date.now()}_${safeName}`);
  fs.writeFileSync(filePath, buffer);
  return filePath;
}
