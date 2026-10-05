import { test, expect, type Page, type Locator } from '@playwright/test';
import { messages } from '../../src/games/ScamShield';

const worlds = ['money', 'hustle', 'scam', 'media', 'fix', 'code', 'career', 'food', 'admin', 'talk', 'power', 'rescue'];
const modes = ['explorer', 'builder', 'master'];
async function openGame(page: Page, world: string, mode = 'explorer', mission = 0) {
  await page.goto(`/#/game/${world}`);
  await page.getByLabel('Difficulty', { exact: true }).selectOption(mode);
  if (mission) await page.getByRole('button', { name: `Mission ${mission + 1}`, exact: false }).click();
  else await page.getByRole('button', { name: 'Start mission 1', exact: true }).click();
  await expect(page.locator('.game-controls')).toBeVisible();
}
async function range(locator: Locator, value: number) {
  await locator.focus(); await locator.press('Home');
  for (let n = 0; n < value; n++) await locator.press('ArrowRight');
}
async function complete(page: Page, world: string, modeIndex: number, mission: number) {
  if (world === 'money') { await page.getByRole('button', { name: 'Start the month' }).click(); for (let n = 0; n < 4; n++) await page.getByRole('button', { name: /Find another way/ }).click(); }
  if (world === 'hustle') { await page.getByRole('button', { name: 'Open for business' }).click(); for (let n = 0; n < 5; n++) await page.getByRole('button', { name: /Run this business day|Finish the workweek/ }).click(); }
  if (world === 'scam') {
    const count = [6, 7, 8][modeIndex];
    for (let n = 0; n < count; n++) {
      const message = messages[(mission * 3 + n * 2 + modeIndex) % messages.length];
      for (const clue of message.clues) await page.getByRole('button', { name: clue, exact: true }).click();
      const bucket = { safe: /Safe in this context/, suspicious: /Suspicious Stop/, verify: /Verify independently Use/ }[message.bucket];
      await page.getByRole('button', { name: bucket }).click();
      await page.getByRole('button', { name: n === count - 1 ? 'Close the case' : 'Next inbox message' }).click();
    }
  }
  if (world === 'media') { for (let n = 0; n < 3; n++) { await page.locator('.source-card').nth(n).click(); await page.getByRole('button', { name: 'Pin to evidence board', exact: true }).click(); } await page.getByRole('button', { name: ['Misleading', 'Misleading', 'Unproven', 'Supported', 'Misleading'][mission], exact: true }).click(); }
  if (world === 'fix') {
    await page.getByRole('button', { name: ['Loose leg joint', 'Available wall space', 'Low virtual pressure gauge', 'Damaged cord insulation', 'Gap beside the frame'][mission], exact: true }).click();
    await page.getByLabel('Measured length', { exact: true }).fill(String([120, 120, 20, 20, 230][mission]));
    await page.getByRole('button', { name: 'Check measurement' }).click();
    await page.getByRole('button', { name: ['Hex key', 'Tape measure', 'Simulated pump', 'Trusted adult / professional', 'Model weather strip'][mission], exact: true }).click();
    await page.getByRole('button', { name: 'Check approach' }).click();
    await range(page.locator('.game-controls input[type=range]'), [50, 62, 45, 100, 55][mission]);
    await page.getByRole('button', { name: mission === 3 ? 'Confirm safe handoff' : 'Run the model test' }).click();
  }
  if (world === 'code') { const size = [5, 6, 7][modeIndex]; for (let n = 0; n < size - 1; n++) await page.getByRole('button', { name: 'Add right command', exact: true }).click(); for (let n = 0; n < size - 1; n++) await page.getByRole('button', { name: 'Add up command', exact: true }).click(); await page.getByRole('button', { name: 'Run program', exact: true }).click(); }
  if (world === 'career') {
    const skills = mission === 2 ? ['Kept a small plant-watering checklist.', 'Worked with a group to set up chairs.', 'Arrived on time for a volunteer event.'] : mission === 4 ? ['Helped organize a club supply shelf.', 'Kept a small plant-watering checklist.', 'Explained a game calmly to a new player.'] : ['Helped organize a club supply shelf.', 'Arrived on time for a volunteer event.', 'Explained a game calmly to a new player.'];
    for (const skill of skills) await page.getByLabel(skill, { exact: true }).check();
    await page.getByRole('button', { name: 'Plan availability' }).click();
    for (const label of [/Monday/, /Wednesday/, /Saturday/]) await page.getByRole('checkbox', { name: label }).check();
    await page.getByRole('button', { name: 'Meet the manager' }).click();
    await page.getByRole('button', { name: /I’m new to paid work/ }).click(); await page.getByRole('button', { name: 'Continue interview' }).click();
    await page.getByRole('button', { name: /Tell the lead/ }).click(); await page.getByRole('button', { name: 'Finish application' }).click();
  }
  if (world === 'food') { for (const food of ['Oats & whole-grain bread', 'Dry / canned beans', 'Frozen mixed vegetables', 'Apples & oranges']) await page.getByRole('button', { name: `Add ${food}`, exact: true }).click(); await page.getByRole('button', { name: 'Plan the menus' }).click(); for (let n = 0; n < 3; n++) await page.locator(`#menu-${n}`).selectOption('0'); await page.getByRole('button', { name: 'Store the groceries' }).click(); await page.locator('#store-veg').selectOption('freezer'); await page.getByRole('button', { name: 'Test my three-day plan' }).click(); }
  if (world === 'admin') { const taskDays = [1, 2, 3, 4, 5, 6, 7]; const selects = page.locator('.task-row select'); for (let n = 0; n < 7; n++) await selects.nth(n).selectOption(String(taskDays[n])); await page.getByRole('button', { name: 'Launch my week' }).click(); for (let day = 1; day <= 8; day++) { for (let slot = 0; slot < 3; slot++) { const actions = await page.getByRole('button', { name: 'Do now', exact: true }).all(); let acted = false; for (const action of actions) if (await action.isEnabled()) { await action.click(); acted = true; break; } if (!acted) break; } await page.getByRole('button', { name: day === 8 ? 'Review my week' : 'Advance to next day' }).click(); } }
  if (world === 'talk') { await page.getByRole('button', { name: /A collaborative plan Ask/ }).click(); await page.getByRole('button', { name: 'Pause and check their perspective' }).click(); for (let n = 0; n < 3; n++) { await page.locator('.dialogue-choices button').first().click(); await page.getByRole('button', { name: n === 2 ? 'Reflect on the conversation' : 'Continue the story' }).click(); } }
  if (world === 'power') { for (let n = 0; n < 2; n++) await page.getByRole('button', { name: /Wind turbine · \$24/ }).click(); for (let n = 0; n < 2; n++) await page.getByRole('button', { name: /Solar panel · \$18/ }).click(); for (let n = 0; n < 6; n++) await page.getByRole('button', { name: n === 5 ? 'Run the final hour' : 'Run this weather turn' }).click(); }
  if (world === 'rescue') {
    const water = mission === 4; await page.getByRole('button', { name: water ? /^Water station/ : /^Help phone/ }).click(); await page.getByRole('button', { name: water ? 'Collect Water bottle' : 'Collect Borrowed phone', exact: true }).click();
    for (const stop of ['Map desk', 'Covered shelter', 'Crossing', 'Trusted help']) { await page.getByRole('button', { name: new RegExp(`^${stop}`) }).click(); await page.locator('.dialogue-choices button').first().click(); await page.getByRole('button', { name: stop === 'Trusted help' ? 'Complete the rescue plan' : 'Continue exploring' }).click(); if (stop === 'Map desk') await page.getByRole('button', { name: 'Collect Route map', exact: true }).click(); }
  }
  await expect(page.getByText('EXPERIMENT COMPLETE', { exact: true })).toBeVisible();
  const score = await page.locator('.result-stats>div').first().innerText(); expect(Number(score.split('/')[0])).toBeGreaterThanOrEqual(60);
  await expect(page.locator('.new-badges')).toBeVisible();
}
for (const [modeIndex, mode] of modes.entries()) for (const world of worlds) {
  test(`${world} can complete a mission in ${mode} mode`, async ({ page }) => {
    const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
    const mission = modeIndex * 2; await openGame(page, world, mode, mission);
    await expect(page.locator('canvas[data-renderer=webgl2]')).toBeVisible();
    await complete(page, world, modeIndex, mission);
    expect(errors).toEqual([]);
  });
}
test('progress survives refresh, export, reset, and import; invalid import preserves the save', async ({ page }) => {
  await openGame(page, 'money'); await complete(page, 'money', 0, 0);
  const saved = await page.evaluate(() => localStorage.getItem('brain-sweat-studio:v1'));
  await page.reload(); await page.getByRole('link', { name: 'My progress', exact: true }).click();
  await expect(page.getByText('1/888', { exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Settings', exact: true }).click();
  const downloadPromise = page.waitForEvent('download'); await page.getByRole('button', { name: 'Export my progress' }).click(); const download = await downloadPromise; const path = await download.path(); expect(path).toBeTruthy();
  await page.getByRole('button', { name: 'Reset progress', exact: true }).click(); await page.getByRole('button', { name: 'Reset everything', exact: true }).click();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('brain-sweat-studio:v1')!).xp)).toBe(0);
  await page.getByLabel('Import my progress', { exact: true }).setInputFiles(path!); await page.getByRole('button', { name: 'Import backup' }).click();
  await expect(page.getByText('Your progress has been imported. Welcome back.')).toBeVisible();
  expect(JSON.parse((await page.evaluate(() => localStorage.getItem('brain-sweat-studio:v1')))!)).toEqual(JSON.parse(saved!));
  await page.getByLabel('Import my progress', { exact: true }).setInputFiles({ name: 'invalid.json', mimeType: 'application/json', buffer: Buffer.from('{"version":99}') }); await page.getByRole('button', { name: 'Import backup' }).click();
  await expect(page.getByText(/not a compatible Brain Sweat save/)).toBeVisible();
  expect(JSON.parse((await page.evaluate(() => localStorage.getItem('brain-sweat-studio:v1')))!)).toEqual(JSON.parse(saved!));
});
test('navigation, search, filters, 404 handling, and hash-route refresh work', async ({ page }) => {
  await page.goto('/'); await expect(page.locator('.world-card')).toHaveCount(37); await expect(page.locator('.adventure-card')).toHaveCount(6); await expect(page.getByRole('heading', { name: 'What sounds fun today?' })).toBeVisible();
  await page.getByPlaceholder('Search worlds or skills').fill('money'); await expect(page.locator('.world-card')).toHaveCount(5);
  await page.getByPlaceholder('Search worlds or skills').fill(''); await page.getByRole('button', { name: 'Digital worlds', exact: true }).click(); await expect(page.locator('.world-card')).toHaveCount(2);
  for (const route of ['progress', 'challenges', 'achievements', 'skills', 'settings', 'privacy', 'adults']) { await page.goto(`/#/${route}`); await expect(page.locator('main h1')).toBeVisible(); await page.reload(); await expect(page.locator('main h1')).toBeVisible(); }
  await page.goto('/#/unknown'); await expect(page.getByText('We couldn’t find that page.')).toBeVisible();
});
test('mobile layout and touch controls remain usable at 320 and 390 pixels', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true }); const page = await context.newPage();
  for (const width of [320, 390]) { await page.setViewportSize({ width, height: 844 }); for (const route of ['/', '/progress', '/challenges', '/achievements', '/skills', '/settings', ...worlds.map(w => `/game/${w}`)]) { await page.goto(`/#${route}`); await expect(page.locator('main h1')).toBeVisible(); expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true); } }
  await page.getByRole('button', { name: 'Open navigation' }).tap(); await expect(page.getByRole('link', { name: 'Settings', exact: true })).toBeVisible(); await page.getByRole('link', { name: 'Play', exact: true }).tap();
  await page.getByRole('link', { name: 'Play Money Mission' }).tap(); await page.getByRole('button', { name: 'Start mission 1' }).tap(); await page.getByRole('button', { name: 'Start the month' }).tap(); for (let i = 0; i < 4; i++) await page.getByRole('button', { name: /Find another way/ }).tap(); await expect(page.getByText('EXPERIMENT COMPLETE')).toBeVisible(); await context.close();
});
test('flagship worlds frame play as adventures and reward the next journey', async ({ page }) => {
  const flagships = [['money', 'Money Captain'], ['hustle', 'Tiny Business Boss'], ['scam', 'Scam Detective'], ['fix', 'Workshop Troubleshooter'], ['code', 'Robot Programmer']] as const;
  for (const [world, role] of flagships) {
    await page.goto(`/#/game/${world}`);
    await expect(page.locator('.flagship-quest-card')).toBeVisible();
    await expect(page.locator('.flagship-role')).toContainText(role);
    await expect(page.locator('.flagship-beats li')).toHaveCount(3);
  }
  await openGame(page, 'money');
  await complete(page, 'money', 0, 0);
  await expect(page.getByText('QUEST CLEARED', { exact: true })).toBeVisible();
  await expect(page.locator('.celebration-burst i')).toHaveCount(12);
  await expect(page.locator('.next-adventure-card')).toContainText('Side Hustle Simulator');
  await expect(page.locator('.next-adventure-card')).toHaveAttribute('href', '#/game/hustle');
});
test('WebGL fallback keeps a game playable', async ({ page }) => {
  await page.addInitScript(() => { const original = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function (type: string, ...args: unknown[]) { if (type === 'webgl2') return null; return original.call(this, type as '2d', ...args); } as typeof original; });
  await openGame(page, 'money'); await expect(page.getByText('Vector mode · all controls still work')).toBeVisible(); await complete(page, 'money', 0, 0);
});
test('pause freezes controls and leaving games frees WebGL buffers', async ({ page }) => {
  await page.addInitScript(() => { const stats = { created: 0, deleted: 0 }; Object.defineProperty(window, '__gpuStats', { value: stats }); const create = WebGL2RenderingContext.prototype.createBuffer; const remove = WebGL2RenderingContext.prototype.deleteBuffer; WebGL2RenderingContext.prototype.createBuffer = function () { stats.created++; return create.call(this); }; WebGL2RenderingContext.prototype.deleteBuffer = function (buffer) { stats.deleted++; return remove.call(this, buffer); }; });
  await openGame(page, 'code'); await page.getByRole('button', { name: 'Add right command', exact: true }).click(); await page.getByRole('button', { name: 'Pause', exact: true }).click(); await expect(page.getByRole('button', { name: 'Add up command', exact: true })).toBeDisabled(); await page.getByRole('button', { name: 'Resume', exact: true }).first().click(); await expect(page.getByRole('button', { name: 'Add up command', exact: true })).toBeEnabled();
  await page.getByRole('link', { name: 'All worlds', exact: true }).click();
  await expect(page.locator('.world-card')).toHaveCount(37); await expect.poll(() => page.evaluate(() => { const stats = (window as unknown as { __gpuStats: { created: number; deleted: number } }).__gpuStats; return stats.created === stats.deleted && stats.created > 0; })).toBe(true);
});
