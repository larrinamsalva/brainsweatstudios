import { describe, expect, it } from 'vitest';
import {
  advanceDriving, answerDriving, beginDriving, drivingChapters, drivingScore,
  drivingSources, drivingStories, freshDriving, missedDriving, penaltyById,
  quizDrivingIds, storyById, validateDriving,
} from '../src/data/driving';
import { freshSave, validateSave } from '../src/systems/progress';
import { build3D, vertexData } from '../src/engine/world3d';

describe('California teen driving curriculum', () => {
  it('offers 120 distinct story questions with complete choices, explanations and primary sources', () => {
    expect(drivingChapters).toHaveLength(12);
    expect(drivingStories).toHaveLength(120);
    expect(new Set(drivingStories.map(story => story.id)).size).toBe(120);
    expect(new Set(drivingStories.map(story => story.story)).size).toBe(120);
    for (const chapter of drivingChapters) expect(chapter.stories).toHaveLength(10);
    for (const story of drivingStories) {
      expect(story.story.split(/\s+/).length).toBeGreaterThanOrEqual(24);
      expect(story.question.length).toBeGreaterThan(15);
      expect(new Set(story.choices).size).toBe(3);
      expect(story.choices[story.answer].length).toBeGreaterThan(10);
      expect(story.explanation.length).toBeGreaterThan(40);
      expect(new URL(drivingSources[story.source].url).hostname).toMatch(/(?:\.ca\.gov|\.courts\.ca\.gov)$/);
      if (story.penalty) expect(penaltyById(story.penalty)).toBeDefined();
    }
    expect(new Set(drivingStories.map(story => story.answer))).toEqual(new Set([0, 1, 2]));
  });

  it('creates varied mixed sets with two unique questions from every chapter', () => {
    const first = quizDrivingIds(1), second = quizDrivingIds(2);
    expect(first).toHaveLength(24);
    expect(new Set(first).size).toBe(24);
    expect(first).not.toEqual(second);
    expect(first).toEqual(quizDrivingIds(1));
    for (const chapter of drivingChapters) expect(first.filter(id => storyById(id)?.chapter === chapter.id)).toHaveLength(2);
  });
});

describe('driving learning, scoring and saved progress', () => {
  it('does not advance unanswered stories or count repeated submission twice', () => {
    const story = drivingStories[0];
    const started = beginDriving(freshDriving(), 'learn', [story.id]);
    expect(advanceDriving(started)).toEqual(started);
    const answered = answerDriving(started, story.answer);
    expect(answerDriving(answered, (story.answer + 1) % 3)).toEqual(answered);
    expect(answered.records[story.id].attempts).toBe(1);
    expect(drivingScore(answered.session!)).toBe(1);
    expect(advanceDriving(answered).session?.finished).toBe(true);
  });

  it('restores an in-progress mixed set without changing the score or question order', () => {
    const ids = quizDrivingIds(42);
    let progress = beginDriving(freshDriving(), 'quiz', ids);
    for (let i = 0; i < 4; i++) {
      const story = storyById(ids[i])!;
      progress = answerDriving(progress, i % 2 ? (story.answer + 1) % 3 : story.answer);
      progress = advanceDriving(progress);
    }
    const restored = validateDriving(JSON.parse(JSON.stringify(progress)));
    expect(restored.session?.index).toBe(4);
    expect(restored.session?.ids).toEqual(ids);
    expect(drivingScore(restored.session!)).toBe(2);
    expect(Object.keys(restored.records)).toHaveLength(4);
  });

  it('lets a learner correct missed stories without inflating another question’s progress', () => {
    const [first, second] = drivingStories;
    let progress = beginDriving(freshDriving(), 'learn', [first.id, second.id]);
    progress = advanceDriving(answerDriving(progress, (first.answer + 1) % 3));
    progress = advanceDriving(answerDriving(progress, second.answer));
    expect(missedDriving(progress)).toEqual([first.id]);
    progress = beginDriving(progress, 'review', missedDriving(progress));
    progress = advanceDriving(answerDriving(progress, first.answer));
    expect(missedDriving(progress)).toEqual([]);
    expect(progress.records[first.id].attempts).toBe(2);
    expect(progress.records[second.id].attempts).toBe(1);
  });

  it('saves and restores driving data through the existing export format without awarding game XP', () => {
    const save = freshSave(), story = drivingStories[0];
    save.driving = answerDriving(beginDriving(save.driving, 'learn', [story.id]), story.answer);
    const restored = validateSave(JSON.parse(JSON.stringify(save)));
    expect(restored.driving).toEqual(save.driving);
    expect(restored.xp).toBe(0);
    expect(restored.points).toBe(0);
    expect(restored.records).toEqual({});
    const legacy = JSON.parse(JSON.stringify(save)); delete legacy.driving;
    expect(validateSave(legacy).driving).toEqual(freshDriving());
  });

  it('rejects damaged driving imports instead of trusting forged state or question identifiers', () => {
    const started = beginDriving(freshDriving(), 'learn', [drivingStories[0].id, drivingStories[1].id]);
    const bad = [
      { ...started, records: { unknown: { choice: 0, attempts: 1 } } },
      { ...started, records: { [drivingStories[0].id]: { choice: 3, attempts: 1 } } },
      { ...started, session: { ...started.session, ids: ['missing'] } },
      { ...started, session: { ...started.session, ids: [drivingStories[0].id, drivingStories[0].id] } },
      { ...started, session: { ...started.session, index: 1 } },
      { ...started, session: { ...started.session, finished: true } },
      { ...started, session: { ...started.session, responses: { unknown: 1 } } },
      { ...started, session: { ...started.session, responses: { [drivingStories[0].id]: -1 } } },
    ];
    for (const raw of bad) expect(() => validateDriving(raw)).toThrow();
  });
});

describe('road objects', () => {
  it('builds finite, distinct geometry for every illustrated situation and existing driving worlds', () => {
    const sizes = new Set<number>();
    for (let scene = 0; scene < 12; scene++) {
      const meshes = build3D('dmv', { scene });
      const vertices = vertexData(meshes);
      expect(meshes.length).toBeGreaterThan(500);
      expect(vertices.every(Number.isFinite)).toBe(true);
      expect(vertices.length).toBeLessThan(250000);
      sizes.add(meshes.length);
    }
    expect(sizes.size).toBeGreaterThan(7);
    expect(build3D('cdl').length).toBeGreaterThan(build3D('driving').length);
  });
});
