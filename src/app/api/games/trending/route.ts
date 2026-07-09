import { NextRequest, NextResponse } from 'next/server';
import { getTrendingGames } from '@/lib/igdb';

/**
 * API Route: GET /api/games/trending?limit=20
 *
 * Get trending/popular games based on ratings
 *
 * Query Parameters:
 *   limit: number - Number of games to return (default: 20, max: 50)
 *
 * Returns: IGDBGame[]
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limitParam = searchParams.get('limit');

    let limit = 20;

    if (limitParam) {
      limit = parseInt(limitParam, 10);

      // Validate limit
      if (isNaN(limit) || limit < 1 || limit > 50) {
        return NextResponse.json(
          { error: 'Limit must be between 1 and 50' },
          { status: 400 }
        );
      }
    }

    // Fetch trending games
    const games = await getTrendingGames(limit);

    return NextResponse.json({
      success: true,
      count: games.length,
      data: games,
    });
  } catch (error) {
    console.error('API Error - Trending Games:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch trending games',
      },
      { status: 500 }
    );
  }
}
