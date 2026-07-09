/**
 * Frontend API Client
 * Calls our Next.js API routes (not IGDB directly)
 *
 * This ensures IGDB credentials stay server-side only
 */

import axios from 'axios';
import { IGDBGame } from './igdb';

// Relative base URL: the API routes live on the same origin as the frontend,
// so this works on localhost and on any deployment domain without configuration.
const apiClient = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

/**
 * Search for games
 * Calls: GET /api/games/search?q=query
 */
export async function searchGames(query: string): Promise<IGDBGame[]> {
  try {
    if (!query.trim()) {
      return [];
    }

    const response = await apiClient.get('/games/search', {
      params: { q: query },
    });

    return response.data.data || [];
  } catch (error) {
    console.error('Error searching games:', error);
    throw error;
  }
}

/**
 * Get game details
 * Calls: GET /api/games/[id]
 */
export async function getGameDetails(gameId: number): Promise<IGDBGame | null> {
  try {
    if (!gameId || gameId <= 0) {
      return null;
    }

    const response = await apiClient.get(`/games/${gameId}`);

    return response.data.data || null;
  } catch (error) {
    console.error('Error fetching game details:', error);
    throw error;
  }
}

/**
 * Get a curated browse list (trending, top, new, upcoming)
 * Calls: GET /api/games/trending?list=...
 */
export async function getBrowseList(
  list: 'trending' | 'top' | 'new' | 'upcoming',
  limit = 20
): Promise<IGDBGame[]> {
  try {
    const response = await apiClient.get('/games/trending', {
      params: { list, limit },
    });

    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching browse list:', error);
    throw error;
  }
}

/**
 * Handle API errors with user-friendly messages
 */
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 404) {
      return 'Game not found';
    }
    if (error.response?.status === 400) {
      return error.response.data?.error || 'Invalid search query';
    }
    if (error.response?.status === 500) {
      return 'Server error. Please try again later.';
    }
    if (error.code === 'ECONNABORTED') {
      return 'Request timeout. Please try again.';
    }
  }

  return 'Failed to load games. Please try again.';
}
