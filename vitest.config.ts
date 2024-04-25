import { defineConfig } from 'vitest/config';
import { TEST_DATABASE_URL } from './src/test/env';

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
    globalSetup: ['./src/test/globalSetup.ts'],
    // Integration tests share one database, so run test files one at a time
    fileParallelism: false,
    env: {
      NODE_ENV: 'test',
      DATABASE_URL: TEST_DATABASE_URL,
      JWT_SECRET: 'test-secret',
    },
  },
});
