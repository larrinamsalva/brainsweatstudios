import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const base = process.env.TEST_BASE_URL || 'http://127.0.0.1:5173/brainsweatstudios/';
const output = path.resolve(process.env.DRIVING_REVIEW_OUT || 'docs/screenshots/driving');
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  const capture = async (name, fullPage = true) => {
    await page.evaluate(() => { if (document.activeElement instanceof HTMLElement) document.activeElement.blur(); window.scrollTo(0, 0); });
    await page.screenshot({ path: path.join(output, `${name}.png`), fullPage });
  };
  await page.goto(base);
  await page.getByRole('link', { name: /Open Teen DMV Practice/ }).waitFor();
  await capture('home', false);
  await page.goto(`${base}#/driving`);
  await page.locator('.road-chapter').last().waitFor();
  await capture('chapters');
  await page.getByLabel('Choose a story in Read the road', { exact: true }).selectOption('signs-1');
  await page.locator('.road-visual .scene-3d').waitFor();
  await capture('story-desktop');
  await page.setViewportSize({ width: 390, height: 844 });
  await capture('story-mobile');
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.getByRole('button', { name: 'Fines & consequences', exact: true }).click();
  await page.getByRole('heading', { name: 'Fines & consequences', exact: true }).waitFor();
  await capture('fines');
  await context.close();
  console.log('Teen driving review captured: home, chapters, desktop/mobile story and fines.');
} finally { await browser.close(); }
