'use client';

import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { searchUsers, SocialUser } from '@/lib/social-data';
import SocialUserList from './SocialUserList';

/** Debounced player search box — results link to each player's profile. */
export default function UserSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SocialUser[]>([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    const cleaned = query.trim();
    if (cleaned.length < 2) {
      setResults([]);
      setSearched(false);
      setSearching(false);
      return;
    }

    setSearching(true);
    const t = setTimeout(async () => {
      try {
        setResults(await searchUsers(cleaned));
        setSearched(true);
      } catch (err) {
        console.error('Failed to search users:', err);
        setResults([]);
        setSearched(true);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(t);
  }, [query]);

  return (
    <div className="mb-10">
      <h2 className="text-sm font-semibold text-dark-text uppercase tracking-wide mb-3">
        Find players
      </h2>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-text" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search players by username..."
          className="w-full pl-10 pr-4 py-2 rounded-lg bg-dark-bg border border-dark-border focus:border-primary outline-none"
        />
      </div>

      {searching && <p className="text-sm text-dark-text mt-3">Searching...</p>}
      {!searching && searched && (
        <div className="mt-3">
          <SocialUserList users={results} emptyLabel="No players found." />
        </div>
      )}
    </div>
  );
}
