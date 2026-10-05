import { expect, test, type Page } from '@playwright/test';

const worlds = ['money', 'hustle', 'scam', 'media', 'fix', 'code', 'career', 'food', 'admin', 'talk', 'power', 'rescue', 'music', 'frequency', 'botany'];
function captureErrors(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  return errors;
}
async function spanish(page: Page) {
  await page.goto('./#/');
  await page.getByLabel('Language', { exact: true }).selectOption('es');
  await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  await expect(page.getByRole('heading', { name: 'Tu próxima gran idea empieza aquí.' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '¿Qué te apetece hacer hoy?' })).toBeVisible();
}

test('Spanish world instructions, controls, and assistant survive navigation and refresh', async ({ page }) => {
  const errors = captureErrors(page); await spanish(page);
  await page.goto('./#/game/money'); await expect(page.locator('.flagship-role')).toContainText('Capitán del dinero'); await expect(page.locator('.flagship-beats')).toContainText('Construye tu plan');
  for (const world of worlds) {
    await page.goto(`./#/game/${world}`);
    await page.getByRole('button', { name: 'Iniciar misión 1', exact: true }).click();
    await expect(page.getByRole('group', { name: 'Controles de la misión' })).toBeVisible();
    await expect(page.locator('.mission-brief .eyebrow')).toHaveText('TU MISIÓN');
    await expect(page.locator('.game-host')).not.toContainText('MONEY & BUSINESS');
  }
  await page.goto('./#/assistant');
  await expect(page.getByRole('heading', { name: 'Tu asistente personal' })).toBeVisible();
  await page.getByRole('button', { name: 'Botánica', exact: true }).click();
  await expect(page.locator('.assistant-intro')).toContainText('Jardín Botánico');
  await expect(page.locator('.council-grid')).toContainText('Estratega');
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Tu asistente personal' })).toBeVisible();
  expect(errors).toEqual([]);
});

test('Spanish visible bot controls complete a changing field mission without earning progress', async ({ page }) => {
  const errors = captureErrors(page); await spanish(page);
  await page.goto('./#/bots');
  await page.getByLabel('Mundo del bot', { exact: true }).selectOption('money');
  await page.getByLabel('Misión del bot', { exact: true }).selectOption('5');
  await page.getByRole('button', { name: 'Iniciar práctica con bot', exact: true }).click();
  await page.getByLabel('Velocidad del bot', { exact: true }).selectOption('120');
  await expect(page.getByText('Práctica con bot completada', { exact: true })).toBeVisible({ timeout: 30000 });
  await expect(page.locator('.result-panel')).not.toContainText('Compared');
  await expect(page.locator('.result-panel')).not.toContainText('Your');
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('brain-sweat-studio:v1')!).xp)).toBe(0);
  expect(errors).toEqual([]);
});

test('Spanish council and new science worlds fit a narrow keyboard interface', async ({ page }) => {
  const errors = captureErrors(page); await page.setViewportSize({ width: 390, height: 844 }); await spanish(page);
  for (const route of ['assistant', 'game/music', 'game/frequency', 'game/botany']) {
    await page.goto(`./#/${route}`);
    if (route.startsWith('game/')) { await page.getByRole('button', { name: 'Iniciar misión 1', exact: true }).click(); await expect(page.locator('.game-controls')).toBeVisible(); }
    else await expect(page.getByRole('heading', { name: 'Tu asistente personal' })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
    await page.keyboard.press('Tab');
    expect(await page.evaluate(() => document.activeElement !== document.body)).toBe(true);
  }
  expect(errors).toEqual([]);
});
