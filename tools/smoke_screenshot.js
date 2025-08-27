const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const msgs = [];
  page.on('console', (m) => msgs.push(m.text()));
  try {
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    // try open launcher button
    const launcher = await page.$('button[aria-label="Open launcher"]');
    if (launcher) {
      await launcher.click().catch(() => {});
      await page.waitForTimeout(500);
    }
    // take screenshot
    await page.screenshot({ path: 'screenshot_settings_check.png', fullPage: true });
    console.log('SCREENSHOT_SAVED:screenshot_settings_check.png');
    console.log('CONSOLE_LOGS_START');
    console.log(JSON.stringify(msgs, null, 2));
    console.log('CONSOLE_LOGS_END');
  } catch (err) {
    console.error('ERROR', err);
  } finally {
    await browser.close();
  }
})();
