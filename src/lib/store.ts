import { create } from 'zustand';
import { InteractionType, UserInteraction } from './user-data';

export type { InteractionType, UserInteraction };

/**
 * Client-side cache of the logged-in user's game interactions.
 * Hydrated from Supabase by <UserDataLoader /> on login;
 * writes always go to the database first (see lib/user-data.ts).
 */
interface AppStore {
  interactions: UserInteraction[];
  setInteractions: (list: UserInteraction[]) => void;
  addInteraction: (interaction: UserInteraction) => void;
  removeInteraction: (id: string) => void;
  hasInteraction: (gameId: number, type: InteractionType) => boolean;
  getInteraction: (gameId: number, type: InteractionType) => UserInteraction | undefined;
}

export const useAppStore = create<AppStore>((set, get) => ({
  interactions: [],
  setInteractions: (list) => set({ interactions: list }),
  addInteraction: (interaction) =>
    set((state) => ({ interactions: [...state.interactions, interaction] })),
  removeInteraction: (id) =>
    set((state) => ({
      interactions: state.interactions.filter((i) => i.id !== id),
    })),
  hasInteraction: (gameId, type) =>
    get().interactions.some((i) => i.gameId === gameId && i.type === type),
  getInteraction: (gameId, type) =>
    get().interactions.find((i) => i.gameId === gameId && i.type === type),
}));
