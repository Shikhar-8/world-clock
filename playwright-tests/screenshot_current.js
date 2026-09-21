import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1200, height: 800 },
    colorScheme: 'dark'
  });
  await page.goto('http://localhost:4321');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'current_ui.png', fullPage: true });
  await browser.close();
})();
