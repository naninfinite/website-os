import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage();
const msgs = [];
page.on('console', (m) => msgs.push(m.text()));
try {
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  const launcher = await page.$('button[aria-label="Open launcher"]');
  if (launcher) {
    await launcher.click();
    await page.waitForTimeout(500);
  }
  // try find Settings button
  const settingsBtn = await page.$('button[aria-label="Open Settings.EXE"]');
  if (settingsBtn) {
    await settingsBtn.click();
    await page.waitForTimeout(500);
    console.log('FOUND_SETTINGS_BUTTON');
  } else {
    console.log('NO_SETTINGS_IN_LAUNCHER');
  }
  await page.screenshot({ path: 'smoke_settings.png', fullPage: true });
  console.log('SCREENSHOT:s moke_settings.png');
  console.log('CONSOLE_LOGS_START');
  console.log(JSON.stringify(msgs, null, 2));
  console.log('CONSOLE_LOGS_END');
} catch (err) {
  console.error('ERROR', err);
} finally {
  await browser.close();
}
