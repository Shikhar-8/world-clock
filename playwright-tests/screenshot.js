import { chromium } from 'playwright';
import fs from 'fs';

(async () => {
  const prefix = process.argv[2] || 'pre';
  
  if (!fs.existsSync(prefix)) {
    fs.mkdirSync(prefix);
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1200, height: 800 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  
  await page.goto('http://localhost:5173');
  await page.waitForTimeout(1000);
  
  // 1. Default Page Load
  await page.screenshot({ path: `${prefix}/01_default.png`, fullPage: true });

  // 2. Toggle Theme (Light Mode)
  await page.click('.theme-switch');
  await page.waitForTimeout(500); // transition
  await page.screenshot({ path: `${prefix}/02_theme_light.png`, fullPage: true });

  // 3. Toggle 24H Format
  await page.click('#format-toggle');
  await page.waitForTimeout(100);
  await page.screenshot({ path: `${prefix}/03_format_24h.png`, fullPage: true });

  // 4. Keyboard Navigation (Search "Lon", Down, Down)
  await page.focus('#city-input');
  await page.waitForTimeout(1500); // Wait for dynamic import
  await page.type('#city-input', 'Lon', { delay: 100 });
  await page.waitForSelector('.suggestion-item', { timeout: 10000 });
  await page.waitForTimeout(500); // Let suggestions settle
  
  await page.keyboard.press('ArrowDown');
  await page.waitForTimeout(200);
  await page.keyboard.press('ArrowDown');
  await page.waitForTimeout(200);
  await page.screenshot({ path: `${prefix}/04_keyboard_nav.png`, fullPage: true });

  // 5. Select via Enter and render Clock
  await page.keyboard.press('Enter');
  await page.waitForTimeout(2000); // Wait for clock spring animation
  await page.screenshot({ path: `${prefix}/05_clock_selected.png`, fullPage: true });

  await browser.close();
  console.log(`Screenshots saved to ${prefix}/ directory.`);
})();
