import { defineConfig } from '@playwright/test';

// Port dédié aux tests (modifiable par E2E_PORT). Le serveur est lancé et arrêté par Playwright lui-même.
const PORT = Number(process.env.E2E_PORT || 5292);

export default defineConfig({
  testDir: 'e2e',
  timeout: 60_000,
  use: {
    baseURL: `http://localhost:${PORT}`,
    launchOptions: process.env.PW_CHROMIUM_PATH ? { executablePath: process.env.PW_CHROMIUM_PATH, args: ['--no-sandbox'] } : undefined,
  },
  webServer: {
    command: `npx vite build --outDir dist-e2e && npx vite preview --outDir dist-e2e --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}/`,
    reuseExistingServer: false,
    timeout: 240_000,
    // Micro-applications remplacées par des modules témoins servis par le test (voir e2e/call-center-redirect.spec.ts).
    env: {
      VITE_MF_AUTH_ENTRY: 'http://mf-auth.test',
      VITE_MF_COMPANY_ENTRY: 'http://mf-company.test',
      VITE_MF_REPS_ENTRY: 'http://mf-reps.test',
      VITE_MF_HOME_ENTRY: 'http://mf-home.test',
      VITE_MF_CALLCENTER_ENTRY: 'http://mf-callcenter.test',
    },
  },
});
