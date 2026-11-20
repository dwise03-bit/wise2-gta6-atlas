import { defineConfig } from '@playwright/test';
export default defineConfig({testDir:'./browser-tests',use:{baseURL:'http://127.0.0.1:4173',channel:process.env.PW_CHANNEL||undefined},webServer:{command:'npm run serve',url:'http://127.0.0.1:4173',reuseExistingServer:!process.env.CI}});
