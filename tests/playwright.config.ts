import { defineConfig, devices } from "@playwright/test";

import { servers } from "./package.json";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 10,
  reporter: "html",
  use: {
    baseURL: servers.clientURL,
    trace: "on-first-retry",
    screenshot: process.env.CI ? "only-on-failure" : undefined,
  },
  projects: [
    // Installing playwright in circleci fails.
    // The error message:
    // E: The repository 'https://dl.google.com/linux/chrome/deb stable InRelease' is not signed.
    // We need to wait for Google to renew their keys according to the ref below
    // https://stackoverflow.com/questions/55647076/the-repository-http-dl-google-com-linux-chrome-deb-stable-release-is-not-sig
    // {
    //   name: 'chromium',
    //   use: { ...devices['Desktop Chrome'] },
    // },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
  ],
});
