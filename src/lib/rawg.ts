import axios from 'axios';

const RAWG_API_KEY = process.env.NEXT_PUBLIC_RAWG_API_KEY;
const RAWG_BASE_URL = 'https://api.rawg.io/api';

if (!RAWG_API_KEY) {
  console.warn('RAWG API Key not configured. Game search will not work.');
}

const rawgClient = axios.create({
  baseURL: RAWG_BASE_URL,
  params: {
    key: RAWG_API_KEY,
  },
});

export interface RAWGGame {
  id: number;
  name: string;
  background_image: string;
  rating: number;
  released: string;
  platforms: Array<{
    platform: {
      name: string;
    };
  }>;
  genres: Array<{
    name: string;
  }>;
  metacritic?: number;
  description?: string;
}

export interface RAWGResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: RAWGGame[];
}

export const searchGames = async (
  query: string,
  page = 1,
  pageSize = 20
): Promise<RAWGResponse> => {
  try {
    const response = await rawgClient.get('/games', {
      params: {
        search: query,
        page,
        page_size: pageSize,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error searching games:', error);
    throw error;
  }
};

export const getGameDetails = async (id: number): Promise<RAWGGame> => {
  try {
    const response = await rawgClient.get(`/games/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching game details:', error);
    throw error;
  }
};

export const getTrendingGames = async (
  page = 1,
  pageSize = 20
): Promise<RAWGResponse> => {
  try {
    const response = await rawgClient.get('/games', {
      params: {
        ordering: '-rating',
        dates: '2024-01-01,2025-12-31',
        page,
        page_size: pageSize,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching trending games:', error);
    throw error;
  }
};
