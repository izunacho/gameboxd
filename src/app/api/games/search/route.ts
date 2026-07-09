import { NextRequest, NextResponse } from 'next/server';
import { searchGames } from '@/lib/igdb';

/**
 * API Route: GET /api/games/search?q=query
 *
 * Search for games by name
 *
 * Query Parameters:
 *   q: string - Game name to search (required)
 *
 * Returns: IGDBGame[]
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    // Validate input
    if (!query) {
      return NextResponse.json(
        { error: 'Search query (q) is required' },
        { status: 400 }
      );
    }

    if (query.length < 2) {
      return NextResponse.json(
        { error: 'Search query must be at least 2 characters' },
        { status: 400 }
      );
    }

    if (query.length > 100) {
      return NextResponse.json(
        { error: 'Search query must be 100 characters or less' },
        { status: 400 }
      );
    }

    // Search games
    const games = await searchGames(query);

    return NextResponse.json({
      success: true,
      count: games.length,
      data: games,
    });
  } catch (error) {
    console.error('API Error - Games Search:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to search games',
      },
      { status: 500 }
    );
  }
}
