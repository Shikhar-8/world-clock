import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1200, height: 800 },
    colorScheme: 'dark'
  });

  // Start the dev server in the background and wait for it
  // (Assuming Vite is already running on port 5173, or we start it)
  
  await page.goto('http://localhost:5173');
  
  // Wait for the loader to finish
  await page.waitForTimeout(1000);
  
  // Inject script to call the exported module function
  await page.evaluate(async () => {
    const mod = await import('/src/ui/toast.ts');
    mod.showToast('Network error: Could not load city database.', 'error', 10000);
  });
  
  // Wait for animation to finish
  await page.waitForTimeout(1000);
  
  // Take screenshot
  await page.screenshot({ path: 'toast_error.png' });
  
  await browser.close();
  console.log("Toast screenshot saved!");
  process.exit(0);
})();
