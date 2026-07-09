import { NextRequest, NextResponse } from 'next/server';
import { getGameDetails } from '@/lib/igdb';

/**
 * API Route: GET /api/games/[id]
 *
 * Get detailed information about a specific game
 *
 * URL Parameters:
 *   id: number - IGDB Game ID (required)
 *
 * Returns: IGDBGame object with full details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const gameId = parseInt(resolvedParams.id, 10);

    // Validate input
    if (isNaN(gameId) || gameId <= 0) {
      return NextResponse.json(
        { error: 'Invalid game ID' },
        { status: 400 }
      );
    }

    // Fetch game details
    const game = await getGameDetails(gameId);

    if (!game) {
      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: game,
    });
  } catch (error) {
    console.error('API Error - Game Details:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch game details',
      },
      { status: 500 }
    );
  }
}
