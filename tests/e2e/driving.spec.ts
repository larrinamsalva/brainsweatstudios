import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { drivingStories, storyById } from '../../src/data/driving';

const entry = process.env.TEST_PRODUCTION === '1' ? '/brainsweatstudios/' : '/';

async function open(page: Page) {
  await page.goto(`${entry}#/driving`);
  await expect(page.getByRole('heading', { name: 'Teen DMV Practice', exact: true })).toBeVisible();
}
async function answer(page: Page, choice: number, quiz = false) {
  await page.getByRole('radio').nth(choice).check();
  await page.getByRole('button', { name: quiz ? 'Save this answer' : 'Check my choice', exact: true }).click();
}

test('the studio opens the new area and every chapter offers ten complete stories', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto(entry);
  await page.getByRole('link', { name: 'Open Teen DMV Practice', exact: false }).click();
  await expect(page.locator('.road-chapter')).toHaveCount(12);
  await expect(page.locator('.road-story-picker option')).toHaveCount(132);
  await expect(page.getByText('California rules for passenger vehicles', { exact: false })).toBeVisible();
  await page.getByLabel('Choose a story in Read the road').selectOption('signs-1');
  await expect(page.getByRole('heading', { name: 'The rolling stop', exact: true })).toBeVisible();
  await expect(page.getByRole('radio')).toHaveCount(3);
  await expect(page.getByRole('button', { name: 'Check my choice' })).toBeDisabled();
  await expect(page.locator('.road-visual canvas[data-renderer=webgl2]')).toBeVisible();
  await page.getByRole('button', { name: 'Orbit right', exact: true }).click();
  await page.getByRole('button', { name: 'Zoom in', exact: true }).click();
  await answer(page, storyById('signs-1')!.answer);
  await expect(page.getByText('Correct choice.', { exact: true })).toBeVisible();
  await expect(page.getByText('Scheduled base fine', { exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: /2026 uniform bail/ })).toHaveAttribute('href', /alameda\.courts\.ca\.gov/);
  expect(errors).toEqual([]);
});

test('a missed answer survives refresh and can be corrected through the missed-story review', async ({ page }) => {
  await open(page);
  await page.getByLabel('Choose a story in Your first set of keys').selectOption('permit-1');
  const story = storyById('permit-1')!;
  await answer(page, (story.answer + 1) % 3);
  await expect(page.getByText('Not quite. Let’s work through it.', { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByText('Not quite. Let’s work through it.', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'See my practice summary', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Practice complete.', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Practice missed stories (1)', exact: true }).click();
  await answer(page, story.answer);
  await expect(page.getByText('Correct choice.', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'All chapters', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Review missed stories (0)', exact: true })).toBeDisabled();
  const state = await page.evaluate(() => JSON.parse(localStorage.getItem('brain-sweat-studio:v1')!).driving);
  expect(state.records['permit-1'].attempts).toBe(2);
  expect(Object.keys(state.records)).toHaveLength(1);
});

test('a full mixed set grades real choices, hides explanations until the end and resumes mid-set', async ({ page }) => {
  await open(page);
  await page.getByRole('button', { name: 'Try 24 mixed stories', exact: true }).click();
  const ids: string[] = await page.evaluate(() => JSON.parse(localStorage.getItem('brain-sweat-studio:v1')!).driving.session.ids);
  for (let index = 0; index < ids.length; index++) {
    const story = storyById(ids[index])!;
    await expect(page.getByRole('heading', { name: story.title, exact: true })).toBeVisible();
    await answer(page, index < 18 ? story.answer : (story.answer + 1) % 3, true);
    await expect(page.getByText('Answer saved.', { exact: true })).toBeVisible();
    await expect(page.locator('.road-feedback')).not.toContainText(story.explanation);
    if (index === 4) { await page.reload(); await expect(page.getByText('Answer saved.', { exact: true })).toBeVisible(); }
    await page.getByRole('button', { name: index === 23 ? 'See my practice summary' : 'Next story', exact: true }).click();
  }
  await expect(page.locator('.road-summary-score')).toHaveText('18 / 24 correct');
  await expect(page.locator('.road-answer-review details')).toHaveCount(24);
  await expect(page.getByRole('button', { name: 'Practice missed stories (6)', exact: true })).toBeVisible();
  await page.locator('.road-answer-review summary').last().click();
  await expect(page.getByText(storyById(ids[23])!.explanation, { exact: true })).toBeVisible();
});

test('driving progress travels with its profile and exported backup', async ({ page }) => {
  await open(page);
  await page.getByLabel('Choose a story in Read the road').selectOption('signs-1');
  await answer(page, storyById('signs-1')!.answer);
  const backup = await page.evaluate(() => localStorage.getItem('brain-sweat-studio:v1')!);
  await page.goto(`${entry}#/settings`);
  await page.getByLabel('Profile nickname', { exact: true }).fill('Road learner');
  await page.getByRole('button', { name: 'Add local profile', exact: true }).click();
  await page.goto(`${entry}#/driving`);
  await expect(page.getByText('Start with a story.', { exact: true })).toBeVisible();
  expect(await page.evaluate(() => Object.keys(JSON.parse(localStorage.getItem('brain-sweat-studio:v1')!).driving.records).length)).toBe(0);
  await page.goto(`${entry}#/settings`);
  await page.getByLabel('Import my progress', { exact: true }).setInputFiles({ name: 'driving-backup.json', mimeType: 'application/json', buffer: Buffer.from(backup) });
  await page.getByRole('button', { name: 'Import backup', exact: true }).click();
  await page.goto(`${entry}#/driving`);
  await expect(page.getByRole('heading', { name: 'The rolling stop', exact: true })).toBeVisible();
  await expect(page.getByText('Correct choice.', { exact: true })).toBeVisible();
});

test('fines distinguish dated examples, base fines, totals, points and court options', async ({ page }) => {
  await open(page);
  await page.getByRole('button', { name: 'Fines & consequences', exact: true }).click();
  await expect(page.locator('.road-penalty')).toHaveCount(8);
  await expect(page.getByText('A base fine is not the whole payment.', { exact: true })).toBeVisible();
  await expect(page.getByText(/Your court’s current notice and schedule control/)).toBeVisible();
  await page.getByRole('button', { name: 'Official sources', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Official sources', exact: true })).toBeVisible();
  for (const link of await page.locator('.road-source-grid a').all()) expect(new URL((await link.getAttribute('href'))!).hostname).toMatch(/\.ca\.gov$/);
});

test('stories stay readable and accessible on a 320px screen with keyboard controls', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 780 });
  await open(page);
  await expect(page.locator('.road-chapter')).toHaveCount(12);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByLabel('Choose a story in Weather changes the mission').selectOption('conditions-3');
  const radio = page.getByRole('radio').first(); await radio.focus(); await radio.press('Space');
  await page.getByRole('button', { name: 'Check my choice' }).click();
  await expect(page.locator('.road-feedback')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const results = await new AxeBuilder({ page }).include('.road-page').analyze();
  expect(results.violations).toEqual([]);
});

test('the illustrated vector fallback still supports the full answer flow without WebGL', async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (...args: Parameters<typeof original>) {
      if (String(args[0]).startsWith('webgl')) return null;
      return original.apply(this, args);
    } as typeof original;
  });
  await open(page);
  await page.getByLabel('Choose a story in Your first set of keys').selectOption('permit-1');
  await expect(page.locator('.road-visual .scene-3d-view>svg')).toBeVisible();
  await expect(page.getByText('VECTOR VIEW · ROAD ILLUSTRATION', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Orbit left', exact: true }).click();
  await answer(page, drivingStories[0].answer);
  await expect(page.getByText('Correct choice.', { exact: true })).toBeVisible();
});

test('the production offline shell keeps the new story route, visuals and saved choices', async ({ page, context }) => {
  test.skip(process.env.TEST_PRODUCTION !== '1', 'Requires the built offline shell.');
  await open(page);
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.waitForFunction(() => !!navigator.serviceWorker.controller);
  await context.setOffline(true);
  await page.reload();
  await page.getByLabel('Choose a story in Your first set of keys').selectOption('permit-1');
  await answer(page, drivingStories[0].answer);
  await page.reload();
  await expect(page.getByText('Correct choice.', { exact: true })).toBeVisible();
  await context.setOffline(false);
});
