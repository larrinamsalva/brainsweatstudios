import { createContext, useContext, useSyncExternalStore, type ReactNode } from 'react';
import type { Difficulty, GameId, SaveData, Settings } from '../data/types';
import * as profiles from './profiles';
import { setLocale } from '../i18n/translate';
interface StudioContextValue {
  save: SaveData; warning: string; profile: profiles.Profile; profiles: profiles.Profile[];
  setDifficulty: (d: Difficulty) => void; updateSettings: (settings: Partial<Settings>) => void;
  finish: (game: GameId, d: Difficulty, mission: number, score: number) => ReturnType<typeof profiles.finishMission>;
  importSave: (raw: unknown) => void; reset: () => void; clearWarning: () => void;
  switchProfile: (id: string) => void; addProfile: (label: string) => void; renameProfile: (label: string) => void;
  exportSave: () => SaveData; saveLesson: typeof profiles.saveLesson;
  saveDriving: typeof profiles.saveDriving;
}
const StudioContext = createContext<StudioContextValue | null>(null);
export function StudioProvider({ children }: { children: ReactNode }) {
  useSyncExternalStore(profiles.subscribe, profiles.getRevision);
  const b = profiles.getBundle(); const profile = profiles.currentProfile();
  setLocale(profile.save.settings.locale);
  return <StudioContext.Provider value={{ save: profile.save, saveLesson: profiles.saveLesson, saveDriving: profiles.saveDriving, warning: profiles.getWarning(), profile, profiles: b.profiles, finish: profiles.finishMission, setDifficulty: profiles.setDifficulty, updateSettings: profiles.updateSettings, importSave: profiles.importSave, reset: profiles.resetProfile, clearWarning: profiles.clearWarning, switchProfile: profiles.switchProfile, addProfile: profiles.addProfile, renameProfile: profiles.renameProfile, exportSave: () => profiles.currentProfile().save }}><div key={profile.id}>{children}</div></StudioContext.Provider>;
}
export function useStudio() { const studio = useContext(StudioContext); if (!studio) throw new Error('StudioProvider is missing.'); return studio; }
