'use client';

import { useEffect, useState } from 'react';
import { getTrendingGames, getErrorMessage } from '@/lib/api-client';
import { IGDBGame } from '@/lib/igdb';
import GameCard from '@/components/GameCard';
import { TrendingUp } from 'lucide-react';

export default function TrendingPage() {
  const [games, setGames] = useState<IGDBGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTrending = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getTrendingGames(30);
        setGames(data);
      } catch (err) {
        setError(getErrorMessage(err));
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadTrending();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-12">
        <TrendingUp className="w-8 h-8 text-primary" />
        <h1 className="text-4xl font-bold">Trending Games</h1>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-lg mb-8">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border border-dark-border border-t-primary"></div>
        </div>
      )}

      {/* Games Grid */}
      {!loading && games.length > 0 && (
        <div className="game-grid">
          {games.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && games.length === 0 && !error && (
        <div className="text-center py-12">
          <p className="text-dark-text text-lg">No trending games available.</p>
        </div>
      )}
    </div>
  );
}
