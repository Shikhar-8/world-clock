import { chromium } from 'playwright';
import { mkdirSync } from 'fs';

const BASE_URL = 'http://localhost:5173';
const prefix = process.argv[2] || 'baseline';

(async () => {
  mkdirSync(prefix, { recursive: true });
  
  const browser = await chromium.launch({ headless: true });
  
  // === DESKTOP (1200x800) ===
  const desktopPage = await browser.newPage({
    viewport: { width: 1200, height: 800 },
    colorScheme: 'dark'
  });
  
  await desktopPage.goto(BASE_URL);
  await desktopPage.waitForTimeout(1500);
  
  // 1. Desktop Dark Mode
  await desktopPage.screenshot({ path: `${prefix}/01_desktop_dark.png`, fullPage: true });
  
  // 2. Desktop Light Mode — toggle theme via JS since checkbox is visually hidden
  await desktopPage.evaluate(() => {
    const el = document.getElementById('theme-toggle-input');
    el.checked = true;
    el.dispatchEvent(new Event('change'));
  });
  await desktopPage.waitForTimeout(300);
  await desktopPage.screenshot({ path: `${prefix}/02_desktop_light.png`, fullPage: true });
  
  // Reset to dark
  await desktopPage.evaluate(() => {
    const el = document.getElementById('theme-toggle-input');
    el.checked = false;
    el.dispatchEvent(new Event('change'));
  });
  await desktopPage.waitForTimeout(300);
  
  await desktopPage.close();
  
  // === MOBILE (375x812) ===
  const mobilePage = await browser.newPage({
    viewport: { width: 375, height: 812 },
    colorScheme: 'dark'
  });
  
  await mobilePage.goto(BASE_URL);
  await mobilePage.waitForTimeout(1500);
  
  // 3. Mobile Dark Mode
  await mobilePage.screenshot({ path: `${prefix}/03_mobile_dark.png`, fullPage: true });
  
  // 4. Mobile Light Mode
  await mobilePage.evaluate(() => {
    const el = document.getElementById('theme-toggle-input');
    el.checked = true;
    el.dispatchEvent(new Event('change'));
  });
  await mobilePage.waitForTimeout(300);
  await mobilePage.screenshot({ path: `${prefix}/04_mobile_light.png`, fullPage: true });
  
  await mobilePage.close();
  await browser.close();
  
  console.log(`Screenshots saved to ${prefix}/ directory.`);
  process.exit(0);
})();
