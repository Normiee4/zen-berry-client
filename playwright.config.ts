import { defineConfig, devices } from "@playwright/test"

const CI = !!process.env.CI

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: CI,
  retries: CI ? 2 : 0,
  workers: CI ? 2 : undefined,
  reporter: CI
    ? [["html"], ["github"]]
    : [["html"], ["list"]],

  expect: {
    timeout: 5_000,
  },

  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: CI ? "on-first-retry" : "off",
  },

  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
    {
      name: "firefox",
      use: {
        ...devices["Desktop Firefox"],
      },
    },
  ],

  webServer: {
    command: CI
      ? "npm run build && npm start"
      : "npm run dev",
    port: 3000,
    timeout: CI ? 180_000 : 120_000,
    reuseExistingServer: !CI,
  },
})
