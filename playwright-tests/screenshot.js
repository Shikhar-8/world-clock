import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
  });
  const page = await context.newPage();
  
  await page.goto('http://localhost:5173');
  await page.waitForTimeout(1000);
  
  // Focus to trigger lazy-load of timezone data
  await page.focus('#city-input');
  await page.waitForTimeout(1500); // Wait for the dynamic import to resolve
  
  // Type slowly to ensure event listeners catch it
  await page.type('#city-input', 'Tokyo', { delay: 100 });
  
  // Wait for dropdown to populate
  await page.waitForSelector('.suggestion-item', { timeout: 10000 });
  
  // Click the first suggestion
  await page.click('.suggestion-item');
  
  // Wait for the clock animation to spring up
  await page.waitForTimeout(2000);
  
  await page.screenshot({ path: 'screenshot_active.png', fullPage: true });
  await browser.close();
  console.log('Screenshot saved to screenshot_active.png');
})();
