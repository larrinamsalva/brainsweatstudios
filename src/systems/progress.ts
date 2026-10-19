import { validateClasses } from '../data/classes';
import { validateCheckpoints } from './checkpointValidation';
import { freshDriving, validateDriving } from '../data/driving';
import { freshAcademy, validateAcademy } from '../training/models';
import { games, totalMissions } from '../data/games';
import { clamp } from '../data/types';
import type { Difficulty, GameId, MissionRecord, SaveData } from '../data/types';

export const SAVE_KEY = 'brain-sweat-studio:v1';
export const localDate = (date = new Date()) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const dayNumber = (date: string) => Date.parse(`${date}T12:00:00Z`) / 86400000;
export const freshSave = (): SaveData => ({
  version: 2, driving: freshDriving(), classes: {}, academy: freshAcademy(), checkpoints: {}, difficulty: 'explorer', xp: 0, points: 0, records: {}, milestones: [], badges: [],
  unlockedGames: games.map(g => g.id), streak: 0, lastPlayed: '', daily: {},
  settings: { music: 0, effects: 0.25, muted: false, reducedMotion: false, highContrast: false, tutorials: true, locale: 'en', haptics: false, botControl: false, labPalette: 'green' },
  selectedDifficulty: false,
});
export const completedCount = (save: SaveData) => Object.values(save.records).filter(r => r.completed).length;
export const levelInfo = (xp: number) => { const level = Math.floor(Math.sqrt(xp / 90)) + 1; const floor = 90 * (level - 1) ** 2; const next = 90 * level ** 2; return { level, floor, next, progress: (xp - floor) / (next - floor) * 100 }; };
export const stars = (score: number) => score >= 90 ? 3 : score >= 60 ? 2 : score > 0 ? 1 : 0;
export const missionKey = (game: GameId, difficulty: Difficulty, mission: number) => `${game}/${difficulty}/${mission}`;
export const gameStats = (save: SaveData, id: GameId) => {
  const records = Object.values(save.records).filter(r => r.game === id);
  return { best: Math.max(0, ...records.map(r => r.score)), completed: records.filter(r => r.completed).length, stars: records.reduce((sum, r) => sum + stars(r.score), 0), attempts: records.reduce((sum, r) => sum + r.attempts, 0) };
};
export interface Badge { id: string; title: string; description: string; icon: string; earned: (save: SaveData) => boolean }
export const badges: Badge[] = [
  { id: 'first', title: 'First Brain Sweat', description: 'Complete your first mission.', icon: 'sparkles', earned: s => completedCount(s) >= 1 },
  { id: 'three', title: 'Triple Threat', description: 'Complete 3 different missions.', icon: 'zap', earned: s => completedCount(s) >= 3 },
  { id: 'six', title: 'Sixth Sense', description: 'Complete 6 different missions.', icon: 'brain', earned: s => completedCount(s) >= 6 },
  { id: 'nine', title: 'Nine Lives Master', description: 'Complete 9 different missions.', icon: 'crown', earned: s => completedCount(s) >= 9 },
  { id: 'all-worlds', title: 'World Wanderer', description: 'Complete a mission in all 12 original worlds.', icon: 'compass', earned: s => games.slice(0, 12).every(g => gameStats(s, g.id).completed > 0) },
  { id: 'level-five', title: 'Brain in Motion', description: 'Reach studio level 5.', icon: 'rocket', earned: s => levelInfo(s.xp).level >= 5 },
  ...games.map(g => ({ id: `${g.id}-first`, title: ({ money: 'Budget Boss', hustle: 'Business Builder', scam: 'Scam Slammer', media: 'Evidence Explorer', fix: 'Fix-It Rookie', code: 'Debug Detective', career: 'Career Starter', food: 'Basket Builder', admin: 'Deadline Defender', talk: 'Communication Champ', power: 'Power Planner', rescue: 'Calm Navigator', music: 'Rhythm Builder', frequency: 'Wave Explorer', botany: 'Garden Guardian', math: 'Equation Explorer', geometry: 'Shape Architect', calculus: 'Change Investigator', physics: 'Motion Modeler', engine: 'Powertrain Builder', robot: 'Robot Engineer', vm: 'Machine Programmer', trail: 'Resilient Traveler', water: 'Water Steward', kitchen: 'Kitchen Creator', creator: 'Studio Producer', driving: 'Road Planner', cdl: 'Freight Planner', trade: 'Blueprint Builder', lines: 'Dispatch Coordinator', electric: 'Circuit Investigator', fire: 'Escape Planner', swim: 'Water Watcher', sports: 'Sport Controller', outpost: 'Supply Controller', scenario: 'Response Controller', space: 'Docking Controller' } as Record<GameId, string>)[g.id], description: `Complete a ${g.title} mission.`, icon: g.icon, earned: (s: SaveData) => gameStats(s, g.id).completed > 0 })),
  ...games.map(g => ({ id: `${g.id}-mastery`, title: `${g.title} Master`, description: `Score 90 or more in ${g.title}.`, icon: 'star', earned: (s: SaveData) => gameStats(s, g.id).best >= 90 })),
];
export function recordResult(save: SaveData, game: GameId, difficulty: Difficulty, mission: number, rawScore: number, date = localDate()) {
  const score = Math.round(clamp(rawScore));
  const key = missionKey(game, difficulty, mission);
  const previous = save.records[key];
  const best = Math.max(previous?.score || 0, score);
  const earnedXP = best > 0 ? Math.round(best) : 0;
  const xpGain = Math.max(0, earnedXP - (previous?.xp || 0));
  const newlyCompleted = score >= 60 && !previous?.completed;
  const daily = save.daily[date] || { missions: 0, games: {}, scores: {} };
  const next: SaveData = {
    ...save, records: { ...save.records, [key]: { game, difficulty, mission, score: best, xp: earnedXP, completed: best >= 60, attempts: (previous?.attempts || 0) + 1, date } },
    xp: save.xp + xpGain, points: save.points + xpGain * 3,
    daily: { ...save.daily, [date]: { missions: daily.missions + (score >= 60 ? 1 : 0), games: { ...daily.games, [game]: (daily.games[game] || 0) + (score >= 60 ? 1 : 0) }, scores: { ...daily.scores, [game]: Math.max(daily.scores[game] || 0, score) } } },
    streak: save.lastPlayed === date ? save.streak : dayNumber(date) - dayNumber(save.lastPlayed) === 1 ? save.streak + 1 : 1, lastPlayed: date,
  };
  let bonus = 0;
  if (newlyCompleted) for (const n of [3, 6, 9]) {
    if (completedCount(next) >= n && !next.milestones.includes(n)) { next.milestones = [...next.milestones, n]; bonus += n * 20; }
  }
  next.xp += bonus; next.points += bonus * 3;
  next.badges = badges.filter(b => b.earned(next)).map(b => b.id);
  return { save: next, xpGain: xpGain + bonus, bonus, newlyCompleted, newBadges: next.badges.filter(b => !save.badges.includes(b)) };
}
const isObject = (v: unknown): v is Record<string, unknown> => v !== null && typeof v === 'object' && !Array.isArray(v);
const int = (v: unknown, max = 1e8): v is number => Number.isInteger(v) && Number(v) >= 0 && Number(v) <= max;
const validDate = (v: unknown): v is string => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) && Number.isFinite(Date.parse(v));
export function validateSave(raw: unknown): SaveData {
  if (!isObject(raw) || (raw.version !== 1 && raw.version !== 2) || (typeof raw.difficulty !== 'string' || !['explorer', 'builder', 'master'].includes(raw.difficulty)) || !isObject(raw.records) || !isObject(raw.settings) || !isObject(raw.daily) || Object.keys(raw.records).length > totalMissions || Object.keys(raw.daily).length > 5000) throw new Error('This is not a compatible Brain Sweat save. Choose an exported version 1 or 2 JSON file.');
  const next = freshSave();
  next.driving = validateDriving(raw.driving);
  next.academy = validateAcademy(raw.academy);
  next.difficulty = raw.difficulty as Difficulty;
  for (const [key, value] of Object.entries(raw.records)) {
    if (!isObject(value) || !games.some(g => g.id === value.game) || (typeof value.difficulty !== 'string' || !['explorer', 'builder', 'master'].includes(value.difficulty)) || !int(value.mission, 7) || !int(value.score, 100) || !int(value.attempts, 100000) || !validDate(value.date)) throw new Error('The mission history in this save is damaged. Your current progress has not changed.');
    const r = value as unknown as MissionRecord;
    if (key !== missionKey(r.game, r.difficulty, r.mission)) throw new Error('The mission identifiers do not match.');
    next.records[key] = { game: r.game, difficulty: r.difficulty, mission: r.mission, score: r.score, attempts: r.attempts, date: r.date, completed: r.score >= 60, xp: r.score };
  }
  next.milestones = [3, 6, 9].filter(n => completedCount(next) >= n);
  next.xp = Object.values(next.records).reduce((sum, r) => sum + r.xp, 0) + next.milestones.reduce((sum, n) => sum + n * 20, 0);
  next.points = next.xp * 3;
  next.badges = badges.filter(b => b.earned(next)).map(b => b.id);
  for (const [date, value] of Object.entries(raw.daily)) {
    if (!validDate(date) || !isObject(value) || !int(value.missions, 100000) || !isObject(value.games) || !isObject(value.scores)) throw new Error('This save has invalid daily progress.');
    const entry = { missions: value.missions, games: {}, scores: {} } as SaveData['daily'][string];
    for (const g of games) {
      if (value.games[g.id] !== undefined) { if (!int(value.games[g.id], 100000)) throw new Error('Invalid daily mission count.'); entry.games[g.id] = value.games[g.id] as number; }
      if (value.scores[g.id] !== undefined) { if (!int(value.scores[g.id], 100)) throw new Error('Invalid daily score.'); entry.scores[g.id] = value.scores[g.id] as number; }
    }
    next.daily[date] = entry;
  }
  const settings = raw.settings;
  for (const field of ['music', 'effects'] as const) { if (typeof settings[field] !== 'number' || !Number.isFinite(settings[field])) throw new Error('Invalid sound settings.'); next.settings[field] = clamp(settings[field] as number, 0, 1); }
  for (const field of ['muted', 'reducedMotion', 'highContrast', 'tutorials'] as const) { if (typeof settings[field] !== 'boolean') throw new Error('Invalid accessibility settings.'); next.settings[field] = settings[field] as boolean; }
  if (raw.version === 2) {
    if ((typeof settings.locale !== 'string' || !['en', 'es'].includes(settings.locale)) || typeof settings.haptics !== 'boolean' || typeof settings.botControl !== 'boolean') throw new Error('Invalid language or practice settings.');
    next.settings.locale = settings.locale as 'en' | 'es'; next.settings.haptics = settings.haptics; next.settings.botControl = settings.botControl;
    next.checkpoints = validateCheckpoints(raw.checkpoints);
    next.classes = validateClasses(raw.classes);
    if (settings.labPalette !== undefined && (typeof settings.labPalette !== 'string' || !['green', 'amber'].includes(settings.labPalette))) throw new Error('Invalid retro lab palette.');
    next.settings.labPalette = settings.labPalette === 'amber' ? 'amber' : 'green';
  }
  next.selectedDifficulty = raw.selectedDifficulty === true;
  next.lastPlayed = validDate(raw.lastPlayed) ? raw.lastPlayed : '';
  next.streak = int(raw.streak, 100000) ? raw.streak : 0;
  return next;
}
export interface DailyChallenge { game: GameId; title: string; target: number; metric: 'missions' | 'score' }
export function dailyChallenges(date = localDate()): DailyChallenge[] {
  let seed = 0; for (const c of date) seed = (seed * 31 + c.charCodeAt(0)) >>> 0;
  return [0, 4, 8].map((offset, i) => { const game = games[(seed + offset) % games.length]; return { game: game.id, title: i === 2 ? `Score 80 in ${game.title}` : `${i === 0 ? 'Complete one mission' : 'Complete two missions'} in ${game.title}`, target: i === 0 ? 1 : i === 1 ? 2 : 80, metric: i === 2 ? 'score' : 'missions' }; });
}
