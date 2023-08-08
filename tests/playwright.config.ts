import { defineConfig, devices } from '@playwright/test';

import { servers } from './package.json';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 10,
  reporter: 'html',
  use: {
    baseURL: servers.clientURL,
    trace: 'on-first-retry',
    screenshot: process.env.CI ? 'only-on-failure' : undefined,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
});
