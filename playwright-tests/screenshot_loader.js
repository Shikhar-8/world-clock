import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1200, height: 800 },
    colorScheme: 'light'
  });
  
  // Pause animations so we can capture the loader
  await page.goto('http://localhost:4321');
  
  // Immediately take a screenshot
  await page.screenshot({ path: 'loader_ui.png', fullPage: true });
  
  await browser.close();
})();
