import { createApp } from './app.js';
import { loadEnv } from './config/env.js';
import { logger } from './utils/logger.js';

const env = loadEnv();
const app = createApp();

app.listen(env.PORT, () => {
  logger.info('Server started', { port: env.PORT, env: env.NODE_ENV });
});
