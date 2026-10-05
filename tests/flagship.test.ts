import { describe, expect, it } from 'vitest';
import { flagshipAdventures } from '../src/data/flagship';
import { games } from '../src/data/games';

describe('kid-first flagship adventures', () => {
  it('keeps exactly five flagship entry worlds with three-step adventure loops', () => {
    expect(Object.keys(flagshipAdventures).sort()).toEqual(['code', 'fix', 'hustle', 'money', 'scam']);
    for (const adventure of Object.values(flagshipAdventures)) {
      expect(adventure).toBeDefined();
      expect(adventure!.beats).toHaveLength(3);
      expect(adventure!.role.length).toBeGreaterThan(3);
      expect(adventure!.celebration.length).toBeGreaterThan(20);
    }
  });

  it('chains every flagship reward into a real playable world', () => {
    const ids = new Set(games.map(game => game.id));
    for (const adventure of Object.values(flagshipAdventures)) {
      expect(ids.has(adventure!.nextId)).toBe(true);
      expect(games.find(game => game.id === adventure!.nextId)?.title).toBe(adventure!.nextLabel);
    }
  });
});
