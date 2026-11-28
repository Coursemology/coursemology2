import { defineConfig, devices } from '@playwright/test';

import baseConfig from './playwright.config';
import { devServer } from './scenarios/support/env';

/**
 * Scenarios drive a local development server and its database, for investigating behaviour by
 * hand. They extend the suite's configuration, but aren't part of CI, which runs
 * `playwright.config.ts` against the test server.
 *
 * Run with `yarn scenarios`.
 */
export default defineConfig({
  ...baseConfig,
  testDir: './scenarios',
  // Results show development data, so they stay in a folder that git ignores. It's separate from
  // `test-results`, which the main suite empties at the start of every run.
  outputDir: './scenario-results/output',
  reporter: [['list'], ['html', { outputFolder: './scenario-results/report', open: 'never' }]],
  // Each scenario sets up its own course and accounts through the UI, so they run one at a time.
  workers: 1,
  timeout: 10 * 60_000,
  use: {
    ...baseConfig.use,
    baseURL: devServer.baseURL,
    ignoreHTTPSErrors: true,
    headless: !process.env.HEADED,
    // Without these, a missing element waits for the whole scenario's timeout.
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    trace: 'on',
    screenshot: 'on',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chrome',
      // The installed Chrome, so scenarios need no browser download.
      use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    },
  ],
});
