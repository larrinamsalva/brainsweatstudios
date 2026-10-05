import { readCatalogue } from './studio-catalogue.mjs';
const studio = await readCatalogue();
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';

if (!process.env.LEGACY_DIST) throw new Error('Set LEGACY_DIST to the built original v1 release.');
const legacy = path.resolve(process.env.LEGACY_DIST);
const current = path.resolve(process.env.CURRENT_DIST || 'dist');
const prefix = '/brainsweatstudios/';
let root = legacy;
let future = false;
const index = await readFile(path.join(current, 'index.html'), 'utf8');
const stylesheet = index.match(/href="([^"]*\/assets\/index[^" ]*\.css)"/)?.[1];
assert.ok(stylesheet, 'Production stylesheet exists.');
const stylesheetFile = `./${stylesheet.slice(prefix.length)}`;
const server = createServer(async (request, response) => {
  const url = new URL(request.url, 'http://127.0.0.1');
  if (!url.pathname.startsWith(prefix)) { response.writeHead(404); response.end(); return; }
  const relative = decodeURIComponent(url.pathname.slice(prefix.length)) || 'index.html';
  const file = path.resolve(root, relative);
  if (!file.startsWith(`${root}/`)) { response.writeHead(404); response.end(); return; }
  try {
    let bytes = await readFile(file);
    // A stylesheet-only release changes its asset URL without duplicating JS modules.
    if (future && relative === 'index.html') bytes = Buffer.from(bytes.toString().replace(stylesheet, `${stylesheet}?release=next`));
    if (future && relative === stylesheet.slice(prefix.length)) bytes = Buffer.from(`${bytes.toString()}\n:root{--upgrade-fixture:1}`);
    if (future && relative === 'sw.js') {
      let source = bytes.toString().replace(/const CACHE = "([^"]+)";/, 'const CACHE = "$1-next";');
      source = source.replace(/const FILES = (\[[^\n]+\]);/, (_match, files) => `const FILES = ${JSON.stringify(JSON.parse(files).map(file => file === stylesheetFile ? `${file}?release=next` : file))};`);
      bytes = Buffer.from(source);
    }
    response.writeHead(200, { 'Content-Type': ({ '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml' })[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' }); response.end(bytes);
  } catch { response.writeHead(404); response.end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${server.address().port}${prefix}`;
const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
let testPage;
try {
  const context = await browser.newContext();
  const page = await context.newPage(); const errors = [];
  testPage = page;
  context.on('page', tab => tab.on('pageerror', error => errors.push(error.message)));
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(base); await page.locator('.world-card').last().waitFor(); assert.equal(await page.locator('.world-card').count(), 12);
  await page.evaluate(() => navigator.serviceWorker.ready); await page.waitForFunction(() => !!navigator.serviceWorker.controller);
  const other = await context.newPage(); await other.goto(base); await other.locator('.world-card').last().waitFor(); assert.equal(await other.locator('.world-card').count(), 12);
  await page.goto(`${base}#/game/money`); await page.getByRole('button', { name: 'Start mission 1', exact: true }).click(); await page.getByRole('button', { name: 'Start the month', exact: true }).click();
  for (let n = 0; n < 4; n++) await page.getByRole('button', { name: /Find another way/ }).click();
  await page.getByText('EXPERIMENT COMPLETE', { exact: true }).waitFor();
  const prior = await page.evaluate(() => JSON.parse(localStorage.getItem('brain-sweat-studio:v1'))); assert.equal(prior.version, 1); assert.equal(prior.xp, 100);
  root = current;
  await page.evaluate(() => { window.__controllerChanges = 0; navigator.serviceWorker.addEventListener('controllerchange', () => window.__controllerChanges++); });
  await page.evaluate(async () => (await navigator.serviceWorker.getRegistration()).update());
  if (process.env.REPRODUCE_STALE === '1') {
    await page.waitForFunction(async () => !!(await navigator.serviceWorker.getRegistration()).waiting);
    await page.reload(); await page.getByRole('link', { name: 'All worlds', exact: true }).click(); await page.locator('.world-card').last().waitFor(); assert.equal(await page.locator('.world-card').count(), 12);
    const fresh = await browser.newContext(); const freshPage = await fresh.newPage(); await freshPage.goto(base); await freshPage.locator('.world-card').last().waitFor(); assert.equal(await freshPage.locator('.world-card').count(), 15); await fresh.close();
    console.log('Reproduced: returning player still sees 12 worlds after refresh while a fresh visitor sees 15. New worker is waiting behind two open v1 tabs.');
  } else {
    await page.waitForFunction(() => window.__controllerChanges > 0);
    // The other old tab can still fetch its lazy game chunk during activation.
    await other.goto(`${base}#/game/code`); await other.getByRole('button', { name: 'Start mission 1', exact: true }).click(); await other.locator('.game-controls').waitFor();
    await page.reload(); await page.getByRole('link', { name: 'All worlds', exact: true }).click(); await page.locator('.world-card').last().waitFor(); assert.equal(await page.locator('.world-card').count(), studio.worlds);
    await page.getByRole('heading', { name: 'What sounds fun today?', exact: true }).waitFor(); assert.equal(await page.locator('.adventure-card').count(), 6);
    // Migration is initially in memory; the next normal save writes the v2 bundle.
    await page.getByRole('link', { name: 'My progress', exact: true }).click(); await page.getByText(`1/${studio.slots}`, { exact: true }).waitFor();
    await page.getByLabel('Difficulty', { exact: true }).selectOption('builder'); await page.getByLabel('Difficulty', { exact: true }).selectOption('explorer');
    const migrated = await page.evaluate(() => JSON.parse(localStorage.getItem('brain-sweat-studio:v1'))); assert.equal(migrated.version, 2); assert.equal(migrated.xp, prior.xp); assert.deepEqual(migrated.records, prior.records);
    await other.reload(); await other.getByRole('link', { name: 'All worlds', exact: true }).click(); await other.locator('.world-card').last().waitFor(); assert.equal(await other.locator('.world-card').count(), studio.worlds);
    await page.goto(`${base}#/game/music`); await page.getByRole('button', { name: 'Start mission 1', exact: true }).click(); await page.getByLabel('Pitch step 16', { exact: true }).selectOption('2');
    future = true; await page.evaluate(async () => (await navigator.serviceWorker.getRegistration()).update());
    await page.getByText('A new studio update is ready.', { exact: true }).waitFor(); assert.equal(await page.getByLabel('Pitch step 16', { exact: true }).inputValue(), '2');
    await page.getByLabel('Language', { exact: true }).selectOption('es'); await page.getByText('Hay una nueva actualización del estudio.', { exact: true }).waitFor();
    await page.getByRole('button', { name: 'Actualizar el estudio', exact: true }).click(); await page.getByRole('button', { name: 'Continuar punto de control', exact: true }).click(); assert.equal(await page.getByLabel('Nota del paso 16', { exact: true }).inputValue(), '2');
    assert.equal(await page.getByText('Hay una nueva actualización del estudio.', { exact: true }).count(), 0);
    await page.getByLabel('Idioma', { exact: true }).selectOption('en'); await page.getByRole('link', { name: 'Play', exact: true }).click(); await context.setOffline(true); await page.reload(); await page.locator('.world-card').last().waitFor(); assert.equal(await page.locator('.world-card').count(), studio.worlds);
    assert.deepEqual(errors, []); console.log('Upgrade verified: two open v1 tabs reach v5, earned progress survives, old lazy assets remain usable, the next update prompts in both languages, melody survives refresh, and offline play works.');
  }
  await context.close();
} catch (error) {
  if (testPage) console.error('Upgrade view:', JSON.stringify(await testPage.evaluate(() => ({ language: document.documentElement.lang, heading: document.querySelector('main h1')?.textContent, selects: Array.from(document.querySelectorAll('select'), select => ({ label: select.getAttribute('aria-label'), source: select.getAttribute('data-source-label'), value: select.value })) })).catch(() => 'Page unavailable')));
  throw error;
} finally { await browser.close(); await new Promise(resolve => server.close(resolve)); }
