import { readCatalogue } from './studio-catalogue.mjs';
const studio = await readCatalogue();
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
const base = process.env.LIVE_SITE_URL || 'https://larrinamsalva.github.io/brainsweatstudios/';
await mkdir('docs/screenshots', { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } }); const page = await context.newPage(); const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto(base, { timeout: 30000 }); await page.locator('.world-card').last().waitFor(); assert.equal(await page.locator('.world-card').count(), studio.worlds);
  assert.equal(await page.locator('meta[name="application-version"]').getAttribute('content'), studio.version, 'The published release metadata must match the checked-out catalogue.');
  await page.getByRole('heading', { name: 'What sounds fun today?', exact: true }).waitFor();
  assert.equal(await page.locator('.adventure-card').count(), 6);
  for (const [name, world] of [['Money Moves', 'money'], ['Street Smart', 'scam'], ['Build & Fix', 'fix'], ['Create Something', 'music'], ['Science Quest', 'power'], ['Future You', 'career']]) {
    const path = page.locator('.adventure-card').filter({ has: page.getByRole('heading', { name, exact: true }) });
    await path.waitFor(); assert.equal(await path.getAttribute('href'), `#/game/${world}`);
  }
  const lab = page.locator('.advanced-lab-banner');
  await lab.getByRole('heading', { name: 'Advanced Lab', exact: true }).waitFor();
  for (const [name, route] of [['Agent Circuit', 'academy?tab=circuit'], ['Town Zero', 'academy?tab=worlds'], ['Agent Garage', 'academy?tab=garage'], ['Performance workshop', 'academy?tab=locker']]) {
    const link = lab.getByRole('link', { name, exact: true });
    await link.waitFor(); assert.equal(await link.getAttribute('href'), `#/${route}`);
  }
  console.log('Live home verified: matching release metadata, six adventure paths and retained Advanced Lab entrances.');
  await page.getByRole('link', { name: 'Assistant & council', exact: true }).click(); await page.getByRole('heading', { name: 'Your personal assistant', exact: true }).waitFor();
  for (const role of ['Mentor', 'Benefactor', 'Strategist']) await page.getByRole('heading', { name: role, exact: true }).waitFor();
  await page.getByLabel('Ask your assistant', { exact: true }).fill('Help me plan a garden'); await page.getByRole('button', { name: 'Send to assistant', exact: true }).click(); await page.getByRole('link', { name: 'Botany Garden · Mission 1', exact: false }).waitFor();
  for (const world of ['music', 'frequency', 'botany','calculus','engine','robot','vm','trail','water','kitchen','creator','driving','cdl','trade','lines','electric','fire','swim','sports','outpost','scenario','space']) { await page.goto(`${base}#/game/${world}`); await page.getByRole('button', { name: /Start mission 1|Resume checkpoint/ }).click(); await page.locator('.game-controls').waitFor(); }
  await page.goto(`${base}#/game/music`); await page.getByRole('button', { name: 'Resume checkpoint', exact: true }).click(); await page.getByRole('button', { name: 'Load a starting pattern', exact: true }).click(); await page.getByRole('button', { name: 'Perform my phrase', exact: true }).click(); await page.getByLabel('Pitch step 16', { exact: true }).selectOption('2'); await page.reload(); await page.getByRole('button', { name: 'Resume checkpoint', exact: true }).click(); assert.equal(await page.getByLabel('Pitch step 16', { exact: true }).inputValue(), '2'); await page.getByRole('button', { name: 'Perform my phrase', exact: true }).click(); await page.getByRole('button', { name: 'Save my composition', exact: true }).click(); await page.getByText('EXPERIMENT COMPLETE', { exact: true }).waitFor();
  await page.getByRole('link', { name: 'Bot lab', exact: true }).click(); await page.getByLabel('Bot world', { exact: true }).selectOption('frequency'); await page.getByLabel('Bot mission', { exact: true }).selectOption('1'); await page.getByRole('button', { name: 'Start bot practice', exact: true }).click(); await page.getByLabel('Bot speed', { exact: true }).selectOption('120'); await page.getByText('Bot practice complete', { exact: true }).waitFor();
  const save = await page.evaluate(() => JSON.parse(localStorage.getItem('brain-sweat-studio:v1'))); assert.equal(save.version, 2); assert.equal(save.records['music/explorer/0'].score, 100); assert.equal(save.records['frequency/explorer/1'], undefined); assert.equal(save.xp, 100);
  await page.getByLabel('Language', { exact: true }).selectOption('es'); await page.getByRole('heading', { name: 'Laboratorio de Frecuencias', exact: true }).waitFor(); await page.reload(); assert.equal(await page.locator('html').getAttribute('lang'), 'es'); await page.getByLabel('Idioma', { exact: true }).selectOption('en'); await page.getByRole('link', { name: 'Play', exact: true }).click(); await page.locator('.world-card').last().waitFor();
  await page.goto(`${base}#/classes`); await page.locator('.class-card').last().waitFor(); assert.equal(await page.locator('.class-card').count(),studio.classes);
  await page.goto(`${base}#/academy`); await page.getByRole('button',{name:'Train controller',exact:true}).click();
  await page.waitForFunction(()=>JSON.parse(localStorage.getItem('brain-sweat-studio:v1')).academy.controllers.sports.history.length===6);
  await page.getByRole('button',{name:'Evaluate champion',exact:true}).click();
  assert.equal(await page.locator('.game-stat').filter({has:page.getByText('Evaluation success',{exact:true})}).locator('strong').innerText(),'8/8');
  await page.goto(`${base}#/academy?tab=rover`); await page.getByRole('button',{name:'Train 1,000 episodes',exact:true}).click();
  await page.waitForFunction(()=>JSON.parse(localStorage.getItem('brain-sweat-studio:v1')).academy.rover.episodes===1000);
  await page.getByRole('button',{name:'Evaluate learned rover',exact:true}).click();
  assert.ok(Number((await page.locator('.game-stat').filter({has:page.getByText('Successful deliveries',{exact:true})}).locator('strong').innerText()).split('/')[0])>=18);
  await page.reload(); assert.equal((await page.evaluate(()=>JSON.parse(localStorage.getItem('brain-sweat-studio:v1')))).academy.rover.episodes,1000);
  await page.goto(`${base}#/academy?tab=lab`); await page.getByRole('button',{name:'Run experiment',exact:true}).click();
  await page.getByRole('heading',{name:'Experiment results',exact:true}).waitFor(); await page.getByRole('button',{name:'Verify replay',exact:true}).click();
  await page.getByText('Replay verified. Every transition and result matches.',{exact:true}).waitFor(); await page.reload(); await page.getByRole('heading',{name:'Verified trace inspector',exact:true}).waitFor();
  await page.goto(`${base}#/academy?tab=garage`); await page.getByRole('button',{name:'Start garage world',exact:true}).click(); await page.getByRole('button',{name:'Run garage episode',exact:true}).click();
  await page.waitForFunction(()=>JSON.parse(localStorage.getItem('brain-sweat-studio:v1')).academy.garage.receipt.result.success);
  await page.getByRole('button',{name:'Verify model world replay',exact:true}).click(); await page.getByText('World replay verified from recorded actions. Model regeneration was not requested.',{exact:true}).waitFor();
  await page.reload(); await page.getByRole('heading',{name:'Model receipt inspector',exact:true}).waitFor();
  await page.goto(`${base}#/academy?tab=worlds`);
  await page.getByLabel('Campaign curriculum', {exact: true}).selectOption('30');
  await page.getByLabel('World controller team', {exact: true}).selectOption('mock');
  await page.getByRole('button', {name: 'Run validated preview', exact: true}).click();
  await page.getByLabel('World run tick cap', {exact: true}).fill('720');
  await page.getByRole('button', {name: 'Run bounded campaign', exact: true}).click();
  await page.waitForFunction(() => JSON.parse(localStorage.getItem('brain-sweat-studio:v1')).academy.worlds.receipt?.result.success, undefined, {timeout: 120000});
  assert.equal((await page.evaluate(() => JSON.parse(localStorage.getItem('brain-sweat-studio:v1')))).academy.worlds.receipt.result.tick, 720);
  await page.getByRole('button', {name: 'Verify long world replay', exact: true}).click();
  await page.getByText('Long world replay and checkpoints verified. No inference was requested.', {exact: true}).waitFor();
  await page.reload(); assert.equal(await page.locator('.world-status').innerText(), 'STOPPED');
  await page.goto(`${base}#/class/derivatives`); await page.getByLabel('Point x',{exact:true}).fill('6'); await page.reload(); assert.equal(await page.getByLabel('Point x',{exact:true}).inputValue(),'6');
  await page.goto(`${base}#/lab/engine`); await page.getByRole('button',{name:'Resume checkpoint',exact:true}).click(); await page.locator('.crt-screen .game-controls').waitFor();
  await page.goto(base); await page.locator('.world-card').last().waitFor();
  await page.locator('.language-select select').selectOption('en');
  await page.evaluate(() => { window.location.hash = '/academy?tab=locker'; });
  await page.getByRole('heading', { name: 'Agent Locker', exact: true }).waitFor();
  await page.getByRole('button', { name: 'Create passport', exact: true }).click();
  await page.getByRole('button', { name: 'Prepare handoff', exact: true }).click();
  await page.getByRole('button', { name: 'Run episode', exact: true }).click();
  await page.getByRole('status').filter({ hasText: 'Execution status: COMPLETE' }).waitFor();
  const career = await page.evaluate(() => JSON.parse(localStorage.getItem('brain-sweat-studio:v1')).academy.career);
  assert.equal(career.agents[0].id, 'studio-agent'); assert.equal(career.runs[0].worldId, 'reserve-lesson'); assert.equal(career.runs[0].receipt.result.tick, 12);
  await page.reload(); await page.getByRole('status').filter({ hasText: 'Execution status: STOPPED' }).waitFor();
  if (studio.major >= 10) {
    await page.getByRole('button', { name: 'Enable circuit families', exact: true }).click();
    for (const family of ['auto-circuit','stunt-show','cache-quest','web-scout','stream-studio','ensemble-lab']) {
      await page.getByLabel('Destination world', { exact: true }).selectOption(family);
      if (family === 'web-scout') await page.getByLabel('Controller selection', { exact: true }).selectOption('mock');
      if (family === 'stream-studio') await page.getByLabel('Memory condition', { exact: true }).selectOption('PRIOR');
      await page.getByRole('button', { name: 'Prepare handoff', exact: true }).click();
      await page.getByRole('button', { name: 'Run episode', exact: true }).click();
      await page.getByRole('status').filter({ hasText: 'Execution status' }).filter({ hasText: 'COMPLETE' }).waitFor();
      const record = await page.evaluate(() => JSON.parse(localStorage.getItem('brain-sweat-studio:v1')).academy.career.runs.at(-1));
      assert.equal(record.worldId, family); assert.equal(record.agentId, 'studio-agent'); assert.equal(record.receipt.result.success, true);
      await page.getByRole('button', { name: 'Retain verified family outputs', exact: true }).click();
    }
    const advanced = await page.evaluate(() => JSON.parse(localStorage.getItem('brain-sweat-studio:v1')).academy.career);
    assert.equal(advanced.runs.length, 7); assert.equal(advanced.artifacts.length, 7);
    assert.equal(advanced.runs.find(r => r.worldId === 'stream-studio').receipt.result.measures.sourceReferences, 2);
    await page.reload(); await page.getByRole('status').filter({ hasText: 'Execution status' }).filter({ hasText: 'STOPPED' }).waitFor();
    console.log('Live circuit families: six completed native mechanics, seven proven artifacts, research-to-show handoff and stopped restoration.');
  }
  if (studio.major >= 11) {
    await page.getByRole('button', { name: 'Render local audio', exact: true }).click();
    await page.getByRole('button', { name: 'Export WAV', exact: true }).waitFor({ state: 'visible' });
    await page.waitForFunction(() => ![...document.querySelectorAll('button')].find(b => b.textContent === 'Export WAV').disabled);
    const downloadReady = page.waitForEvent('download'); await page.getByRole('button', { name: 'Export WAV', exact: true }).click();
    const audioDownload = await downloadReady;
    const { readFile } = await import('node:fs/promises'); const wav = await readFile(await audioDownload.path());
    assert.equal(wav.subarray(0, 4).toString(), 'RIFF');
    assert.equal(await page.locator('audio').evaluate(a => a.paused), true);
    console.log('Live synthetic performance: verified local worker render, real WAV export and stopped playback.');
  }
  if (studio.major >= 12) {
    const { agentModule } = await import('./agent-module.mjs');
    const { decodeCircuitStorage } = await agentModule('src/circuit/storage.ts');
    const { validateCircuit } = await agentModule('src/circuit/evidence.ts');
    await page.goto(`${base}#/academy?tab=circuit`);
    await page.getByRole('heading', { name: 'Circuit Paddock', exact: true }).waitFor();
    await page.getByRole('button', { name: 'Create two starter teams', exact: true }).click();
    await page.getByRole('button', { name: 'Freeze new season', exact: true }).click();
    for (let i = 0; i < 6; i++) {
      await page.getByRole('button', { name: 'Run next event', exact: true }).click();
      await page.waitForFunction(() => document.querySelector('[data-circuit-status]')?.getAttribute('data-circuit-status') === 'COMPLETE', undefined, { timeout: 45000 });
    }
    const readCircuit = async () => {
      const raw = await page.evaluate(() => { const b = JSON.parse(localStorage.getItem('brain-sweat-studio:profiles:v2')); return b.profiles.find(p => p.id === b.active).save.academy.circuit; });
      return raw.schema === 'circuit-storage@1' ? decodeCircuitStorage(raw) : validateCircuit(raw);
    };
    const circuit = await readCircuit(); assert.equal(circuit.events.length, 6);
    assert(circuit.events.every(e => e.ending === 'COMPLETE' && e.parts.every(p => p.native.result.success)));
    assert.equal(circuit.events[3].parts[0].shifts.length, 24);
    assert(circuit.events[5].parts[1].admissions[0].assets.some(a => a.type === 'research-dossier'));
    await page.reload(); await page.getByRole('heading', { name: 'Circuit Paddock', exact: true }).waitFor();
    assert.equal(await page.getByTestId('circuit-status').textContent(), 'STOPPED');
    assert.deepEqual((await readCircuit()).events.map(e => e.digest), circuit.events.map(e => e.digest));
    console.log('Live Agent Circuit: six events, 19 native phases, seven families, actual Town role rotations, proven score/research/show continuity and stopped profile restoration.');
  }
  await page.screenshot({ path: 'docs/screenshots/live-studio.png' }); assert.deepEqual(errors, []);
  console.log(`Live v${studio.major} verified: 30-day Town Zero, long replay, stopped restoration, Agent Garage, hidden survey, validated mock actions, world replay, profile restore, 37 worlds, 48 classes, controller optimization, learned rover, frozen evaluation, academy refresh, council, retro lab, player rewards, bot isolation, Spanish refresh, Agent Locker passport continuity and stopped restoration, and zero page errors.`); await context.close();
} finally { await browser.close(); }
