import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests',
  timeout: 120000,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: 'http://127.0.0.1:5173',
    headless: true,
    actionTimeout: 15000,
    launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE, args: process.env.PLAYWRIGHT_CHROMIUM_ARGS ? JSON.parse(process.env.PLAYWRIGHT_CHROMIUM_ARGS) : ['--no-sandbox', '--disable-dev-shm-usage'] } : {},
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure'
  },
  webServer: [
    { command: 'node ../../BackEnd/BackEnd/tests/browser-server.cjs', url: 'http://127.0.0.1:3000', reuseExistingServer: false, timeout: 60000 },
    { command: 'npm run dev -- --host 127.0.0.1', url: 'http://127.0.0.1:5173', env: { VITE_BACK_END_SERVER_URL: 'http://127.0.0.1:3000' }, reuseExistingServer: false }
  ]
});
