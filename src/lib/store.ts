import { create } from 'zustand';

export interface UserReview {
  id: string;
  gameId: number;
  userId: string;
  rating: number;
  content: string;
  likedCount: number;
  createdAt: string;
}

export interface GameInteraction {
  id: string;
  gameId: number;
  userId: string;
  type: 'played' | 'wishlist' | 'liked';
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  avatar?: string;
  bio?: string;
  createdAt: string;
}

interface AppStore {
  user: User | null;
  setUser: (user: User | null) => void;
  reviews: Record<number, UserReview[]>;
  addReview: (review: UserReview) => void;
  interactions: GameInteraction[];
  addInteraction: (interaction: GameInteraction) => void;
  removeInteraction: (id: string) => void;
  hasInteraction: (gameId: number, type: GameInteraction['type']) => boolean;
}

export const useAppStore = create<AppStore>((set, get) => ({
  user: null,
  setUser: (user) => set({ user }),
  reviews: {},
  addReview: (review) =>
    set((state) => ({
      reviews: {
        ...state.reviews,
        [review.gameId]: [...(state.reviews[review.gameId] || []), review],
      },
    })),
  interactions: [],
  addInteraction: (interaction) =>
    set((state) => ({
      interactions: [...state.interactions, interaction],
    })),
  removeInteraction: (id) =>
    set((state) => ({
      interactions: state.interactions.filter((i) => i.id !== id),
    })),
  hasInteraction: (gameId, type) => {
    const interactions = get().interactions;
    return interactions.some((i) => i.gameId === gameId && i.type === type);
  },
}));
