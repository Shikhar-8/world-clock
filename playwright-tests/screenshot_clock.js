import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1200, height: 800 },
    colorScheme: 'light' // The user's screenshot was in light mode
  });
  await page.goto('http://localhost:4321');
  
  // Type in the search box
  await page.fill('#city-input', 'Sao Paulo');
  await page.waitForTimeout(500); // Wait for suggestions
  
  // Click the first suggestion
  await page.click('#suggestions .suggestion-item:first-child');
  await page.waitForTimeout(1000); // Wait for animation
  
  // Take screenshot
  await page.screenshot({ path: 'clock_ui.png', fullPage: true });
  await browser.close();
})();
