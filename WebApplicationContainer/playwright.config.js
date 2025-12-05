 // @ts-check
/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
  webServer: {
    command: 'npm start',
    port: 3000,
    timeout: 120000,
    reuseExistingServer: true
  },
  use: {
    headless: true,
    baseURL: 'http://localhost:3000'
  },
  testDir: 'tests/e2e'
};
export default config;
