import { defineConfig, devices } from '@playwright/test';

const slowMo = Number(process.env['PW_SLOW_MO'] ?? '0');

if (!Number.isFinite(slowMo) || slowMo < 0) {
  throw new Error('PW_SLOW_MO must be a non-negative number of milliseconds.');
}

export default defineConfig({
  testDir: './e2e',
  outputDir: './e2e/test-output',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  workers: process.env['CI'] ? 1 : 2,
  // Slow runs are for watching the browser and may exceed the normal test timeout.
  timeout: slowMo > 0 ? 0 : 30_000,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:4310',
    trace: 'retain-on-failure',
    launchOptions: { slowMo },
  },
  projects: [
    { name: 'chromium-en', use: { ...devices['Desktop Chrome'], locale: 'en-US' } },
    { name: 'chromium-bn', use: { ...devices['Desktop Chrome'], locale: 'bn-BD' } },
  ],
  webServer: {
    command: 'npm start -- --host 127.0.0.1 --port 4310',
    url: 'http://127.0.0.1:4310',
    reuseExistingServer: !process.env['CI'],
    timeout: 120_000,
  },
});
