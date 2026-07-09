'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { loadMyLibrary, MyLibrary, LibraryGame } from '@/lib/user-data';
import { User, CheckCircle2, Bookmark, Heart, Star } from 'lucide-react';

function GameTile({ game }: { game: LibraryGame }) {
  return (
    <Link href={`/game/${game.igdb_id}`}>
      <div className="card overflow-hidden group cursor-pointer">
        <div className="relative w-full aspect-[3/4] bg-dark-bg">
          {game.background_image ? (
            <Image
              src={game.background_image}
              alt={game.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-dark-text text-xs text-center px-2">No cover</span>
            </div>
          )}
        </div>
        <div className="p-3">
          <h3 className="font-semibold text-sm line-clamp-2">{game.name}</h3>
          {game.released && (
            <p className="text-xs text-dark-text mt-1">
              {new Date(game.released).getFullYear()}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function ProfilePage() {
  const [username, setUsername] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [library, setLibrary] = useState<MyLibrary>({ interactions: [], reviews: [] });
  const [loading, setLoading] = useState(true);
  const [notLoggedIn, setNotLoggedIn] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        if (!data.user) {
          setNotLoggedIn(true);
          return;
        }
        setUsername(data.user.user_metadata?.username || null);
        setEmail(data.user.email || null);
        setLibrary(await loadMyLibrary());
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading && !notLoggedIn) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border border-dark-border border-t-primary"></div>
      </div>
    );
  }

  if (notLoggedIn) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
        <User className="w-12 h-12 text-primary mx-auto" />
        <h1 className="text-2xl font-bold">Your Profile</h1>
        <p className="text-dark-text">Log in to see your games and reviews.</p>
        <Link href="/auth/login" className="btn-primary inline-block">
          Log In
        </Link>
      </div>
    );
  }

  const played = library.interactions.filter((i) => i.type === 'played');
  const wishlist = library.interactions.filter((i) => i.type === 'wishlist');
  const liked = library.interactions.filter((i) => i.type === 'liked');

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
      {/* Profile Header */}
      <div className="card p-6 flex items-center gap-4">
        <div className="bg-primary/20 p-4 rounded-full">
          <User className="w-10 h-10 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">{username || 'Player'}</h1>
          {email && <p className="text-dark-text text-sm">{email}</p>}
          <p className="text-dark-text text-sm mt-1">
            {played.length} played · {wishlist.length} wishlisted · {liked.length} liked ·{' '}
            {library.reviews.length} review(s)
          </p>
        </div>
      </div>

      {/* My Reviews */}
      <section>
        <h2 className="flex items-center gap-2 text-2xl font-bold mb-6">
          <Star className="w-6 h-6 text-primary" />
          My Reviews
        </h2>
        {library.reviews.length === 0 ? (
          <div className="card p-6 text-center text-dark-text">
            <p>
              You haven't reviewed any games yet.{' '}
              <Link href="/explore" className="text-primary hover:underline">
                Find one to rate!
              </Link>
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {library.reviews.map((r) => (
              <div key={r.id} className="card p-5 flex gap-4">
                <Link href={`/game/${r.game.igdb_id}`} className="shrink-0">
                  <div className="relative w-16 h-20 rounded overflow-hidden bg-dark-bg">
                    {r.game.background_image && (
                      <Image
                        src={r.game.background_image}
                        alt={r.game.name}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                </Link>
                <div className="flex-grow min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <Link
                      href={`/game/${r.game.igdb_id}`}
                      className="font-semibold hover:text-primary truncate"
                    >
                      {r.game.name}
                    </Link>
                    <span className="bg-primary text-black font-bold px-2 py-0.5 rounded text-sm shrink-0">
                      {r.rating}/100
                    </span>
                  </div>
                  {r.content && (
                    <p className="text-dark-text text-sm line-clamp-3">{r.content}</p>
                  )}
                  <p className="text-xs text-dark-text mt-2">
                    {new Date(r.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Played */}
      <section>
        <h2 className="flex items-center gap-2 text-2xl font-bold mb-6">
          <CheckCircle2 className="w-6 h-6 text-primary" />
          Played ({played.length})
        </h2>
        {played.length === 0 ? (
          <p className="text-dark-text">No games marked as played yet.</p>
        ) : (
          <div className="game-grid">
            {played.map((i) => (
              <GameTile key={i.id} game={i.game} />
            ))}
          </div>
        )}
      </section>

      {/* Wishlist */}
      <section>
        <h2 className="flex items-center gap-2 text-2xl font-bold mb-6">
          <Bookmark className="w-6 h-6 text-primary" />
          Wishlist ({wishlist.length})
        </h2>
        {wishlist.length === 0 ? (
          <p className="text-dark-text">Your wishlist is empty.</p>
        ) : (
          <div className="game-grid">
            {wishlist.map((i) => (
              <GameTile key={i.id} game={i.game} />
            ))}
          </div>
        )}
      </section>

      {/* Liked */}
      <section>
        <h2 className="flex items-center gap-2 text-2xl font-bold mb-6">
          <Heart className="w-6 h-6 text-primary" />
          Liked ({liked.length})
        </h2>
        {liked.length === 0 ? (
          <p className="text-dark-text">You haven't liked any games yet.</p>
        ) : (
          <div className="game-grid">
            {liked.map((i) => (
              <GameTile key={i.id} game={i.game} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
