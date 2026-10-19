import { draftChapters } from './drivingStories';

export type RoadScene = 'permit' | 'signal' | 'stop' | 'highway' | 'school' | 'parking' | 'rain' | 'night' | 'rail' | 'work' | 'emergency' | 'bike';
export type StoryDraft = readonly [title: string, story: string, question: string, correct: string, otherA: string, otherB: string, explanation: string, scene?: RoadScene, penalty?: string, source?: DrivingSourceId];
export const drivingReviewed = '2026-10-19';
const handbook = 'https://www.dmv.ca.gov/portal/handbook/california-driver-handbook/';
export const drivingSources = {
  permits: { title: 'California DMV · Permits and teen licenses', url: `${handbook}getting-an-instruction-permit-and-drivers-license/` },
  signs: { title: 'California DMV · Signals, signs and right-of-way', url: `${handbook}laws-and-rules-of-the-road/` },
  lanes: { title: 'California DMV · Lanes, turns and passing', url: `${handbook}navigating-the-roads/` },
  parking: { title: 'California DMV · Parking and traffic stops', url: `${handbook}navigating-the-roads-cont1/` },
  sharing: { title: 'California DMV · Sharing the road', url: `${handbook}laws-and-rules-of-the-road-cont1/` },
  records: { title: 'California DMV · Violations and driving records', url: `${handbook}laws-and-rules-of-the-road-cont2/` },
  safe: { title: 'California DMV · Safe driving', url: `${handbook}safe-driving/` },
  basics: { title: 'California DMV · Preparing to drive and distraction', url: `${handbook}introduction-to-driving/` },
  conditions: { title: 'California DMV · Weather and visibility', url: `${handbook}safe-driving/` },
  speed: { title: 'California DMV · Speed and emergencies', url: `${handbook}safe-driving-cont2/` },
  impairment: { title: 'California DMV · Alcohol and drugs', url: `${handbook}alcohol-and-drugs/` },
  insurance: { title: 'California DMV · Insurance and collisions', url: `${handbook}financial-responsibility-insurance-requirements-and-collisions/` },
  restraints: { title: 'California DMV · Seat belts and child restraints', url: `${handbook}safe-driving-cont1/` },
  license: { title: 'California DMV · License changes and renewal', url: `${handbook}changing-replacing-and-renewing-your-drivers-license/` },
  phone: { title: 'California Highway Patrol · Teen driver safety', url: 'https://www.chp.ca.gov/programs-services/programs/youth-programs-and-services/start-smart-driving-smart-to-stay-safe' },
  relief: { title: 'California Courts · Asking for help with a fine', url: 'https://selfhelp.courts.ca.gov/traffic/ask-lower-fine' },
  registration: { title: 'California DMV · Vehicle registration', url: `${handbook}vehicle-registration-requirements/` },
  fines: { title: 'Alameda Superior Court · 2026 uniform bail and penalty schedule', url: 'https://www.alameda.courts.ca.gov/system/files/forms-and-filings/2026-judicial-council-statewide-uniform-bail-and-penalty-schedule.pdf' },
  court: { title: 'California Courts · Traffic self-help', url: 'https://selfhelp.courts.ca.gov/traffic' },
  teen: { title: 'California DMV · Teen Driver Roadmap', url: 'https://www.dmv.ca.gov/portal/teen-drivers/' },
} as const;
export type DrivingSourceId = keyof typeof drivingSources;

export interface RoadPenalty { id: string; title: string; code: string; base: string; exampleTotal?: string; points: string; consequence: string }
// These are dated, ordinary-infraction examples from the linked court's 2026
// table, not a quote for a particular ticket or a statewide flat payment.
export const roadPenalties: RoadPenalty[] = [
  { id: 'stop', title: 'Rolling through a stop sign', code: 'VC 22450(a)', base: '$35', exampleTotal: '$234', points: '1 point', consequence: 'A stop requires the wheels to stop. A moving-violation conviction can also affect insurance and a provisional license.' },
  { id: 'red', title: 'Running a red light', code: 'VC 21453(a), (c)', base: '$100', exampleTotal: '$486', points: '1 point', consequence: 'These examples concern a red signal or red arrow violation. Right-turn violations and camera civil penalties can follow different schedules.' },
  { id: 'speed15', title: 'Speeding 1–15 mph over the limit', code: 'VC 22349(a), (b)', base: '$35', exampleTotal: '$234', points: '1 point', consequence: 'This is an ordinary speeding example, not a construction-zone, repeat-offense, or over-100-mph case. A posted limit never makes an unsafe speed safe.' },
  { id: 'speed25', title: 'Speeding 16–25 mph over the limit', code: 'VC 22349(a), (b)', base: '$70', exampleTotal: '$363', points: '1 point', consequence: 'The scheduled amount rises with the speeding bracket. Insurance, traffic school and license consequences are separate.' },
  { id: 'speed26', title: 'Speeding 26+ mph over the limit', code: 'VC 22349(a), (b)', base: '$100', exampleTotal: '$486', points: '1 point', consequence: 'This ordinary-speeding row does not cover every high-speed offense. Driving over 100 mph has separate penalties and possible suspension.' },
  { id: 'phone', title: 'A minor using a wireless device while driving', code: 'VC 23124(b)', base: '$20 first offense; $50 subsequent', exampleTotal: '$158 first-offense example', points: 'A repeat qualifying conviction within 36 months can add 1 point', consequence: 'Drivers under 18 cannot use a wireless device while driving, even hands-free, except for an emergency call. Repeat offenses may have different amounts.' },
  { id: 'belt', title: 'Required seat belt not worn', code: 'VC 27315(d), (e)', base: 'Up to $20 first offense; up to $50 subsequent', exampleTotal: '$158 first-offense example', points: '0 points in this schedule', consequence: 'Zero scheduled points does not mean no fine or no danger. Child-restraint violations have separate rules and penalties.' },
  { id: 'insurance', title: 'Failure to show required financial responsibility', code: 'VC 16028(a)', base: '$200 scheduled example', exampleTotal: '$896', points: '0 points in this schedule', consequence: 'This is the schedule row for failure to provide evidence, not a quote for every uninsured case. Proof of valid coverage at the time may qualify for different court treatment.' },
];
export interface RoadStory {
  id: string; chapter: string; title: string; story: string; question: string;
  choices: string[]; answer: number; explanation: string; scene: RoadScene;
  source: DrivingSourceId; penalty?: string;
}
export const drivingChapters = draftChapters.map((chapter, chapterIndex) => ({
  ...chapter,
  stories: chapter.stories.map((draft, index): RoadStory => {
    const [title, story, question, correct, otherA, otherB, explanation, scene, penalty, source] = draft;
    const answer = (chapterIndex + index) % 3;
    const choices = [otherA, otherB]; choices.splice(answer, 0, correct);
    return { id: `${chapter.id}-${index + 1}`, chapter: chapter.id, title, story, question, choices, answer, explanation, scene: scene || chapter.scene, source: source || chapter.source, penalty };
  }),
}));
export const drivingStories = drivingChapters.flatMap(chapter => chapter.stories);
export const storyById = (id: string) => drivingStories.find(story => story.id === id);
export const penaltyById = (id?: string) => roadPenalties.find(penalty => penalty.id === id);

export interface DrivingRecord { choice: number; attempts: number }
export interface DrivingSession {
  mode: 'learn' | 'quiz' | 'review'; ids: string[]; index: number;
  responses: Record<string, number>; finished: boolean;
}
export interface DrivingProgress { schema: 1; records: Record<string, DrivingRecord>; session: DrivingSession | null }
export const freshDriving = (): DrivingProgress => ({ schema: 1, records: {}, session: null });
const object = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value);
export function validateDriving(raw: unknown): DrivingProgress {
  if (raw === undefined) return freshDriving();
  if (!object(raw) || raw.schema !== 1 || !object(raw.records) || Object.keys(raw.records).length > drivingStories.length) throw new Error('Invalid teen driving progress.');
  const next = freshDriving();
  for (const [id, record] of Object.entries(raw.records)) {
    if (!storyById(id) || !object(record) || !Number.isInteger(record.choice) || Number(record.choice) < 0 || Number(record.choice) > 2 || !Number.isInteger(record.attempts) || Number(record.attempts) < 1 || Number(record.attempts) > 100000) throw new Error('Invalid driving story answer.');
    next.records[id] = { choice: Number(record.choice), attempts: Number(record.attempts) };
  }
  if (raw.session !== null) {
    const session = raw.session;
    if (!object(session) || !['learn', 'quiz', 'review'].includes(String(session.mode)) || !Array.isArray(session.ids) || session.ids.length < 1 || session.ids.length > drivingStories.length || !session.ids.every(id => typeof id === 'string' && storyById(id)) || new Set(session.ids).size !== session.ids.length || !Number.isInteger(session.index) || Number(session.index) < 0 || Number(session.index) >= session.ids.length || !object(session.responses) || typeof session.finished !== 'boolean') throw new Error('Invalid driving practice session.');
    const responses: Record<string, number> = {};
    for (const [id, choice] of Object.entries(session.responses)) {
      if (!session.ids.includes(id) || session.ids.indexOf(id) > Number(session.index) || next.records[id]?.choice !== choice || !Number.isInteger(choice) || Number(choice) < 0 || Number(choice) > 2) throw new Error('Invalid driving practice response.');
      responses[id] = Number(choice);
    }
    if (session.ids.some((id, index) => index < Number(session.index) && responses[id] === undefined) || (session.finished && session.ids.some(id => responses[id] === undefined))) throw new Error('Incomplete driving practice history.');
    next.session = { mode: session.mode as DrivingSession['mode'], ids: [...session.ids] as string[], index: Number(session.index), responses, finished: session.finished };
  }
  return next;
}
export function beginDriving(progress: DrivingProgress, mode: DrivingSession['mode'], ids: string[]): DrivingProgress {
  return validateDriving({ ...progress, session: { mode, ids, index: 0, responses: {}, finished: false } });
}
export function answerDriving(progress: DrivingProgress, choice: number): DrivingProgress {
  const session = progress.session;
  if (!session || session.finished || !Number.isInteger(choice) || choice < 0 || choice > 2) return progress;
  const id = session.ids[session.index];
  if (session.responses[id] !== undefined) return progress;
  return { ...progress, records: { ...progress.records, [id]: { choice, attempts: Math.min(100000, (progress.records[id]?.attempts || 0) + 1) } }, session: { ...session, responses: { ...session.responses, [id]: choice } } };
}
export function advanceDriving(progress: DrivingProgress): DrivingProgress {
  const session = progress.session;
  if (!session || session.finished || session.responses[session.ids[session.index]] === undefined) return progress;
  return { ...progress, session: { ...session, index: Math.min(session.index + 1, session.ids.length - 1), finished: session.index === session.ids.length - 1 } };
}
export const missedDriving = (progress: DrivingProgress) => drivingStories.filter(story => progress.records[story.id] && progress.records[story.id].choice !== story.answer).map(story => story.id);
export const drivingScore = (session: DrivingSession) => session.ids.filter(id => { const story = storyById(id); return story && session.responses[id] === story.answer; }).length;
export function quizDrivingIds(seed = Date.now()): string[] {
  // Two distinct stories per chapter. The complete bank stays available in Learn.
  let state = seed >>> 0;
  const random = () => { state = (Math.imul(state, 1664525) + 1013904223) >>> 0; return state / 2 ** 32; };
  const shuffle = <T,>(items: T[]) => { for (let i = items.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [items[i], items[j]] = [items[j], items[i]]; } return items; };
  return shuffle(drivingChapters.flatMap(chapter => shuffle(chapter.stories.map(story => story.id)).slice(0, 2)));
}
