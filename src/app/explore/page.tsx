'use client';

import { useState, useEffect } from 'react';
import { searchGames, getTrendingGames, getErrorMessage } from '@/lib/api-client';
import { IGDBGame } from '@/lib/igdb';
import GameCard from '@/components/GameCard';
import { Search } from 'lucide-react';

export default function ExplorePage() {
  const [games, setGames] = useState<IGDBGame[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Load trending games on mount
  useEffect(() => {
    const loadTrendingGames = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getTrendingGames(20);
        setGames(data);
      } catch (err) {
        setError(getErrorMessage(err));
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (!hasSearched) {
      loadTrendingGames();
    }
  }, [hasSearched]);

  // Handle search
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setLoading(true);
      setError(null);
      const data = await searchGames(searchQuery);
      setGames(data);
      setHasSearched(true);
    } catch (err) {
      setError(getErrorMessage(err));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle clear search
  const handleClearSearch = () => {
    setSearchQuery('');
    setHasSearched(false);
    setGames([]);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-12">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-text" />
          <input
            type="text"
            placeholder="Search games..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-lg bg-dark-surface border border-dark-border focus:border-primary outline-none"
            disabled={loading}
          />
        </div>
        <p className="text-xs text-dark-text mt-2">Powered by IGDB</p>
      </form>

      {/* Title */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">
          {hasSearched ? `Search Results for "${searchQuery}"` : 'Trending Games'}
        </h1>
        {hasSearched && (
          <button
            onClick={handleClearSearch}
            className="btn-secondary text-sm"
          >
            Clear Search
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-lg mb-8">
          <p className="font-semibold">Error</p>
          <p>{error}</p>
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
        <>
          <p className="text-dark-text mb-4">{games.length} game(s) found</p>
          <div className="game-grid">
            {games.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        </>
      )}

      {/* Empty State */}
      {!loading && games.length === 0 && !error && (
        <div className="text-center py-12">
          <p className="text-dark-text text-lg">
            {hasSearched ? 'No games found. Try a different search.' : 'No games available'}
          </p>
        </div>
      )}
    </div>
  );
}
