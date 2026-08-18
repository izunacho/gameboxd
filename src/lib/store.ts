import { create } from 'zustand';
import { InteractionType, UserInteraction } from './user-data';
import { UserCosmetics, NO_COSMETICS } from './cosmetics';

export type { InteractionType, UserInteraction };

/**
 * Client-side cache of the logged-in user's game interactions and their own
 * premium cosmetics. Hydrated from Supabase by <UserDataLoader /> and
 * <AccentLoader /> on login; writes always go to the database first
 * (see lib/user-data.ts).
 *
 * Caching the viewer's own cosmetics here is what lets the header and home
 * page show their tick without either of them querying the users table.
 */
interface AppStore {
  interactions: UserInteraction[];
  setInteractions: (list: UserInteraction[]) => void;
  addInteraction: (interaction: UserInteraction) => void;
  removeInteraction: (id: string) => void;
  hasInteraction: (gameId: number, type: InteractionType) => boolean;
  getInteraction: (gameId: number, type: InteractionType) => UserInteraction | undefined;
  myCosmetics: UserCosmetics;
  setMyCosmeticsState: (cosmetics: UserCosmetics) => void;
}

export const useAppStore = create<AppStore>((set, get) => ({
  interactions: [],
  myCosmetics: NO_COSMETICS,
  setMyCosmeticsState: (cosmetics) => set({ myCosmetics: cosmetics }),
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
