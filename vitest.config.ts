import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
    env: {
      NODE_ENV: 'test',
      DATABASE_URL: 'postgresql://roam:roam@localhost:5432/roam_test?schema=public',
      JWT_SECRET: 'test-secret',
    },
  },
});
