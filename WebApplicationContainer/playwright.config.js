 // @ts-check
import { defineConfig, devices } from '@playwright/test';

const useProdBuild = process.env.PLAYWRIGHT_USE_BUILD === '1';
const port = Number(process.env.PORT || 3000);
const baseURL = process.env.PLAYWRIGHT_BASE_URL || `http://localhost:${port}`;

const webServer = useProdBuild
  ? {
      command: `npm run build && npx serve -s build -l ${port}`,
      url: baseURL,
      reuseExistingServer: false,
      timeout: 120000,
    }
  : {
      command: 'npm start',
      url: baseURL,
      reuseExistingServer: true,
      timeout: 120000,
    };

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    headless: true,
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer,
});
