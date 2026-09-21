import { chromium } from 'playwright';
import { mkdirSync } from 'fs';

const BASE_URL = 'http://localhost:4321';
const prefix = 'verify_interactions';

(async () => {
  mkdirSync(prefix, { recursive: true });
  
  const browser = await chromium.launch({ headless: true });
  
  const page = await browser.newPage({
    viewport: { width: 1200, height: 800 },
    colorScheme: 'dark'
  });
  
  await page.goto(BASE_URL);
  await page.waitForTimeout(1500); // Wait for loader
  
  // 1. Search suggestions
  await page.focus('#city-input');
  await page.waitForTimeout(500); // Wait for lazy load of city-timezones
  await page.fill('#city-input', 'Lon');
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${prefix}/01_search_suggestions.png` });
  
  // Hover over the first suggestion to test the hover/active state
  await page.hover('.suggestion-item:first-child');
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${prefix}/02_search_suggestion_hover.png` });
  
  // 2. Clock show
  await page.click('.suggestion-item:first-child');
  await page.waitForTimeout(800); // Wait for clock spring animation
  await page.screenshot({ path: `${prefix}/03_clock_display.png` });
  
  // 3. Toast appearance
  // Type something that yields no results to show "no results" state
  await page.fill('#city-input', 'UnknownCityX');
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${prefix}/04_no_results.png` });
  
  // For toast, we can evaluate a script to trigger it, since the UI only triggers it on load error or manual error
  await page.evaluate(() => {
    // Dispatch a fake error event or just call the global if we exposed it, but we didn't expose it.
    // Instead we can click something that fails? No, toast is only on network error.
    // We can inject a toast manually for visual testing.
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    const baseToastClasses = 'bg-surface-primary text-text-primary px-[24px] py-[12px] rounded-[100px] font-base text-[0.875rem] font-medium tracking-wide shadow-[0_8px_24px_rgba(0,0,0,0.12)] border border-border-primary flex items-center gap-[10px] will-change-[transform,opacity]';
    const errorToastClasses = 'border-[rgba(255,60,60,0.3)] shadow-[0_8px_24px_rgba(255,60,60,0.08),0_0_0_1px_rgba(255,60,60,0.1)]';
    toast.className = `toast ${baseToastClasses} ${errorToastClasses}`;
    toast.innerHTML = `<span class="flex items-center justify-center text-[#ff4a4a]"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg></span><span class="toast-message">Verification Toast Error</span>`;
    container.appendChild(toast);
    toast.animate([
      { transform: 'translateY(-100px) scale(0.9)', opacity: 0 },
      { transform: 'translateY(0) scale(1)', opacity: 1 }
    ], {
      duration: 600,
      easing: 'linear(0, 0.416 12.5%, 0.741 24.3%, 0.954 36.3%, 1.056 46.5%, 1.085 53.6%, 1.083 61.1%, 1.045 70%, 1.012 79.5%, 0.996 90.7%, 1)',
      fill: 'forwards'
    });
  });
  
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${prefix}/05_toast_error.png` });
  
  await page.close();
  await browser.close();
  
  console.log(`Verification screenshots saved to ${prefix}/ directory.`);
  process.exit(0);
})();
