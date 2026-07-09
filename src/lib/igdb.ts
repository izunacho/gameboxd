/**
 * IGDB Service - Server-side only
 * Handles IGDB API calls with Twitch authentication
 *
 * This module should NOT be imported in client components
 * Use API routes instead: /api/games/*
 */

import axios, { AxiosInstance } from 'axios';

const IGDB_API_URL = 'https://api.igdb.com/v4';

interface IGDBAccessToken {
  access_token: string;
  expires_at: number;
}

// In-memory cache for access token (in production, use Redis)
let cachedToken: IGDBAccessToken | null = null;

/**
 * Get or refresh IGDB access token from Twitch
 */
async function getAccessToken(): Promise<string> {
  // Check if cached token is still valid
  if (cachedToken && cachedToken.expires_at > Date.now()) {
    return cachedToken.access_token;
  }

  const clientId = process.env.IGDB_CLIENT_ID;
  const clientSecret = process.env.IGDB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('IGDB_CLIENT_ID and IGDB_CLIENT_SECRET must be set in environment variables');
  }

  try {
    const response = await axios.post(
      'https://id.twitch.tv/oauth2/token',
      null,
      {
        params: {
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: 'client_credentials',
        },
      }
    );

    const { access_token, expires_in } = response.data;

    // Cache token with 1 minute buffer before expiration
    cachedToken = {
      access_token,
      expires_at: Date.now() + (expires_in - 60) * 1000,
    };

    return access_token;
  } catch (error) {
    console.error('Failed to get IGDB access token:', error);
    throw new Error('Failed to authenticate with IGDB/Twitch');
  }
}

/**
 * Create IGDB API client with authentication
 */
async function createIGDBClient(): Promise<AxiosInstance> {
  const accessToken = await getAccessToken();

  return axios.create({
    baseURL: IGDB_API_URL,
    headers: {
      'Client-ID': process.env.IGDB_CLIENT_ID,
      'Authorization': `Bearer ${accessToken}`,
    },
  });
}

/**
 * IGDB Game object interface
 */
export interface IGDBGame {
  id: number;
  name: string;
  cover?: {
    id: number;
    image_id: string;
    height: number;
    width: number;
  };
  rating?: number;
  first_release_date?: number;
  platforms?: Array<{
    id: number;
    name: string;
    abbreviation: string;
  }>;
  genres?: Array<{
    id: number;
    name: string;
  }>;
  summary?: string;
  storyline?: string;
  aggregated_rating?: number;
  aggregated_rating_count?: number;
}

/**
 * Search games by name
 * Returns up to 10 results
 */
export async function searchGames(query: string): Promise<IGDBGame[]> {
  if (!query.trim()) {
    return [];
  }

  try {
    const client = await createIGDBClient();

    const response = await client.post('/games', `search "${query}"; fields id, name, cover.*, rating, first_release_date, platforms.*, genres.*, summary; limit 10;`);

    return response.data;
  } catch (error) {
    console.error('Error searching IGDB games:', error);
    throw new Error('Failed to search games');
  }
}

/**
 * Get game details by ID
 * Includes all available information
 */
export async function getGameDetails(gameId: number): Promise<IGDBGame | null> {
  if (!gameId || gameId <= 0) {
    return null;
  }

  try {
    const client = await createIGDBClient();

    const response = await client.post(
      '/games',
      `fields id, name, cover.*, rating, first_release_date, platforms.*, genres.*, summary, storyline, aggregated_rating, aggregated_rating_count, involved_companies.*; where id = ${gameId};`
    );

    return response.data?.[0] || null;
  } catch (error) {
    console.error('Error fetching IGDB game details:', error);
    throw new Error('Failed to fetch game details');
  }
}

/**
 * Get trending/popular games
 * Returns top rated games
 */
export async function getTrendingGames(limit = 20): Promise<IGDBGame[]> {
  try {
    const client = await createIGDBClient();

    const response = await client.post(
      '/games',
      `fields id, name, cover.*, rating, first_release_date, platforms.*, genres.*; where rating > 70; sort rating desc; limit ${limit};`
    );

    return response.data;
  } catch (error) {
    console.error('Error fetching IGDB trending games:', error);
    throw new Error('Failed to fetch trending games');
  }
}

/**
 * Convert IGDB cover image ID to URL
 * IGDB returns image IDs, not full URLs
 *
 * Format: https://images.igdb.com/igdb/image/upload/t_cover_big/{image_id}.jpg
 */
export function getIGDBImageUrl(imageId: string, size: 'thumb' | 'cover_small' | 'cover_big' | 'screenshot_med' | 'screenshot_big' = 'cover_big'): string {
  const sizeMap: Record<string, string> = {
    thumb: 't_thumb',
    cover_small: 't_cover_small',
    cover_big: 't_cover_big',
    screenshot_med: 't_screenshot_med',
    screenshot_big: 't_screenshot_big',
  };

  return `https://images.igdb.com/igdb/image/upload/${sizeMap[size]}/${imageId}.jpg`;
}

/**
 * Format IGDB release date (Unix timestamp) to readable date
 */
export function formatReleaseDate(unixTimestamp: number): string {
  if (!unixTimestamp) return 'N/A';

  try {
    const date = new Date(unixTimestamp * 1000);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return 'N/A';
  }
}

/**
 * Get rating color based on score
 */
export function getRatingColor(rating?: number): string {
  if (!rating) return 'text-gray-400';
  if (rating >= 80) return 'text-green-500';
  if (rating >= 70) return 'text-yellow-500';
  if (rating >= 60) return 'text-orange-500';
  return 'text-red-500';
}
