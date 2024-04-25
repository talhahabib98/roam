import { execSync } from 'node:child_process';
import { TEST_DATABASE_URL } from './env';

// Applies migrations to the dedicated test database before any test file runs
export default function setup() {
  execSync('npx prisma migrate deploy', {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: TEST_DATABASE_URL },
  });
}
