import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 30000,
  expect: { timeout: 5000 },
  fullyParallel: false,
  reporter: [
    ['dot'],
    ['junit', { outputFile: 'e2e-results/playwright-junit.xml' }],
    ['./scripts/playwright-sonar-reporter.js', { outputFile: 'e2e-results/sonar-test-execution.xml' }]
  ],
  use: {
    baseURL: process.env.TEST_BASE_URL || 'http://localhost:3001',
    trace: 'off'
  },
  projects: [
    { name: 'api', use: {} }
  ]
});
