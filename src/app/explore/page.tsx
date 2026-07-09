'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { searchGames, getBrowseList, getErrorMessage } from '@/lib/api-client';
import { IGDBGame } from '@/lib/igdb';
import GameCard from '@/components/GameCard';
import { Search } from 'lucide-react';

const LISTS = [
  { key: 'trending', label: 'Trending', title: 'Trending Games' },
  { key: 'top', label: 'Top Rated', title: 'Top Rated of All Time' },
  { key: 'new', label: 'New Releases', title: 'New Releases' },
  { key: 'upcoming', label: 'Coming Soon', title: 'Coming Soon' },
] as const;

type ListKey = (typeof LISTS)[number]['key'];

function ExploreContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeQuery = searchParams.get('q') || '';
  const listParam = searchParams.get('list') || 'trending';
  const activeList: ListKey = (LISTS.find((l) => l.key === listParam)?.key ?? 'trending') as ListKey;

  const [searchInput, setSearchInput] = useState(activeQuery);
  const [games, setGames] = useState<IGDBGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // The URL is the source of truth: ?q= searches, otherwise ?list= picks a browse tab.
  useEffect(() => {
    setSearchInput(activeQuery);

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = activeQuery
          ? await searchGames(activeQuery)
          : await getBrowseList(activeList, 30);
        setGames(data);
      } catch (err) {
        setError(getErrorMessage(err));
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [activeQuery, activeList]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const value = searchInput.trim();
    if (value) router.push(`/explore?q=${encodeURIComponent(value)}`);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    router.push('/explore');
  };

  const activeTitle = activeQuery
    ? `Search Results for "${activeQuery}"`
    : LISTS.find((l) => l.key === activeList)?.title;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-text" />
          <input
            type="text"
            placeholder="Search games..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-lg bg-dark-surface border border-dark-border focus:border-primary outline-none"
          />
        </div>
        <p className="text-xs text-dark-text mt-2">Powered by IGDB</p>
      </form>

      {/* Browse Tabs (hidden while searching) */}
      {!activeQuery && (
        <div className="flex gap-2 mb-8 overflow-x-auto pb-1">
          {LISTS.map((list) => (
            <button
              key={list.key}
              onClick={() => router.push(`/explore?list=${list.key}`)}
              className={`btn text-sm whitespace-nowrap ${
                activeList === list.key
                  ? 'bg-primary text-black'
                  : 'bg-dark-surface border border-dark-border text-dark-text hover:bg-dark-border'
              }`}
            >
              {list.label}
            </button>
          ))}
        </div>
      )}

      {/* Title */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">{activeTitle}</h1>
        {activeQuery && (
          <button onClick={handleClearSearch} className="btn-secondary text-sm">
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
          {activeQuery && <p className="text-dark-text mb-4">{games.length} game(s) found</p>}
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
            {activeQuery ? 'No games found. Try a different search.' : 'No games available'}
          </p>
        </div>
      )}
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center py-24">
          <div className="animate-spin rounded-full h-12 w-12 border border-dark-border border-t-primary"></div>
        </div>
      }
    >
      <ExploreContent />
    </Suspense>
  );
}
