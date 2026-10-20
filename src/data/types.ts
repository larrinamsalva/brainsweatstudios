import type { LessonRecord } from './classes';
import type { AcademySave } from '../training/models';
import type { ComponentType } from 'react';
import type { DrivingProgress } from './driving';

export type Difficulty = 'explorer' | 'builder' | 'master';
export type Skill = 'Money' | 'Business' | 'Safety' | 'Digital literacy' | 'Problem solving' | 'Logic' | 'Work' | 'Health' | 'Independence' | 'Communication' | 'Technology' | 'Music' | 'Sound science' | 'Botany' | 'Ecology' | 'Mathematics' | 'Geometry' | 'Calculus' | 'Physics' | 'Engineering' | 'Robotics' | 'Computing' | 'Resilience' | 'Water systems' | 'Cooking' | 'Production';
export type GameId = 'money' | 'hustle' | 'scam' | 'media' | 'fix' | 'code' | 'career' | 'food' | 'admin' | 'talk' | 'power' | 'rescue' | 'music' | 'frequency' | 'botany' | 'math' | 'geometry' | 'calculus' | 'physics' | 'engine' | 'robot' | 'vm' | 'trail' | 'water' | 'kitchen' | 'creator' | 'driving' | 'cdl' | 'trade' | 'lines' | 'electric' | 'fire' | 'swim' | 'sports' | 'outpost' | 'scenario' | 'space';
export interface GameManifest {
  id: GameId; title: string; description: string; category: string;
  skills: Skill[]; color: string; icon: string; minutes: string;
  missions: number; xp: number; route: string;
  load: () => Promise<{ default: ComponentType<GameProps> }>;
}
export interface GameResult { score: number; summary: string; lesson: string; metrics?: Record<string, string | number> }
export interface GameProps { difficulty: Difficulty; mission: number; onFinish: (result: GameResult) => void; paused: boolean }
export interface MissionRecord { game: GameId; difficulty: Difficulty; mission: number; score: number; xp: number; attempts: number; completed: boolean; date: string }
export interface DailyRecord { missions: number; games: Partial<Record<GameId, number>>; scores: Partial<Record<GameId, number>> }
export interface Settings { music: number; effects: number; muted: boolean; reducedMotion: boolean; highContrast: boolean; tutorials: boolean; locale: 'en' | 'es'; haptics: boolean; botControl: boolean; labPalette: 'green' | 'amber' }
export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };
export interface Checkpoint { state: Record<string, Json>; updatedAt: string; botPractice: boolean }
export interface SaveData {
  driving: DrivingProgress;
  version: 2; classes: Record<string, LessonRecord>; academy: AcademySave; difficulty: Difficulty; xp: number; points: number;
  records: Record<string, MissionRecord>; milestones: number[];
  badges: string[]; unlockedGames: GameId[];
  streak: number; lastPlayed: string; daily: Record<string, DailyRecord>;
  settings: Settings; selectedDifficulty: boolean; checkpoints: Record<string, Checkpoint>;
}
export const DIFFICULTIES: { id: Difficulty; name: string; detail: string; age: string }[] = [
  { id: 'explorer', name: 'Explorer', detail: 'Room to experiment. Simple numbers and helpful clues.', age: 'Roughly 8–11' },
  { id: 'builder', name: 'Builder', detail: 'More moving parts. Find your own strategy.', age: 'Roughly 12–14' },
  { id: 'master', name: 'Master', detail: 'Tight resources. Deeper decisions. Bigger challenges.', age: 'Roughly 15–17' },
];
export const difficultyIndex = (d: Difficulty) => ['explorer', 'builder', 'master'].indexOf(d);
export const clamp = (v: number, min = 0, max = 100) => Math.min(max, Math.max(min, v));
export const money = (v: number) => `$${v.toFixed(v % 1 === 0 ? 0 : 2)}`;
