const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('http://localhost:5173');

  const checkStyles = async (width) => {
    await page.setViewportSize({ width, height: 1080 });
    // wait for layout
    await page.waitForTimeout(500);
    
    // Evaluate and return styles
    const styles = await page.evaluate(() => {
      const app = document.querySelector('#app');
      const time = document.querySelector('.time-display');
      
      const appRect = app.getBoundingClientRect();
      const timeStyle = window.getComputedStyle(time);
      const rootStyle = window.getComputedStyle(document.documentElement);
      const bodyStyle = window.getComputedStyle(document.body);
      
      return {
        rootFontSize: rootStyle.fontSize,
        bodyFontSize: bodyStyle.fontSize,
        appLeftEdge: appRect.left,
        timeFontSize: timeStyle.fontSize,
      };
    });
    
    console.log(`\n--- Viewport: ${width}px ---`);
    console.log(`Root HTML font-size:`, styles.rootFontSize);
    console.log(`Body font-size:`, styles.bodyFontSize);
    console.log(`Time Font Size (computed):`, styles.timeFontSize);
  };

  await checkStyles(1280);
  await checkStyles(1920);

  await browser.close();
})();
