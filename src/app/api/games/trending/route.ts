import { NextRequest, NextResponse } from 'next/server';
import { getBrowseGames, BrowseList, BROWSE_LISTS } from '@/lib/igdb';

/**
 * API Route: GET /api/games/trending?list=trending&limit=20
 *
 * Curated browse lists.
 *
 * Query Parameters:
 *   list: 'trending' | 'top' | 'new' | 'upcoming' (default: trending)
 *   limit: number 1-50 (default: 20)
 *
 * Returns: IGDBGame[]
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const list = searchParams.get('list') || 'trending';
    if (!BROWSE_LISTS.includes(list as BrowseList)) {
      return NextResponse.json(
        { error: `list must be one of: ${BROWSE_LISTS.join(', ')}` },
        { status: 400 }
      );
    }

    let limit = 20;
    const limitParam = searchParams.get('limit');
    if (limitParam) {
      limit = parseInt(limitParam, 10);
      if (isNaN(limit) || limit < 1 || limit > 50) {
        return NextResponse.json(
          { error: 'Limit must be between 1 and 50' },
          { status: 400 }
        );
      }
    }

    const games = await getBrowseGames(list as BrowseList, limit);

    return NextResponse.json({
      success: true,
      count: games.length,
      data: games,
    });
  } catch (error) {
    console.error('API Error - Browse Games:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch games',
      },
      { status: 500 }
    );
  }
}
