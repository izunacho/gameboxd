'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getPublicProfile, PublicProfile } from '@/lib/user-data';
import GameTile from '@/components/GameTile';
import { User, CheckCircle2, Bookmark, Heart, Star, UserX } from 'lucide-react';

interface PublicProfileClientProps {
  username: string;
}

export default function PublicProfileClient({ username }: PublicProfileClientProps) {
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        setProfile(await getPublicProfile(username));
      } catch (err) {
        setError('Failed to load this profile. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [username]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border border-dark-border border-t-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
        <UserX className="w-12 h-12 text-dark-text mx-auto" />
        <h1 className="text-2xl font-bold">User not found</h1>
        <p className="text-dark-text">
          There's no player called <span className="text-primary">{username}</span> on Hitboxd.
        </p>
        <Link href="/community" className="btn-primary inline-block">
          Back to Community
        </Link>
      </div>
    );
  }

  const { library } = profile;
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
          <h1 className="text-3xl font-bold">{profile.username}</h1>
          {profile.bio && <p className="text-dark-text mt-1">{profile.bio}</p>}
          <p className="text-dark-text text-sm mt-1">
            Joined{' '}
            {new Date(profile.created_at).toLocaleDateString('en-US', {
              month: 'long',
              year: 'numeric',
            })}
          </p>
          <p className="text-dark-text text-sm mt-1">
            {played.length} played · {wishlist.length} wishlisted · {liked.length} liked ·{' '}
            {library.reviews.length} review(s)
          </p>
        </div>
      </div>

      {/* Reviews */}
      <section>
        <h2 className="flex items-center gap-2 text-2xl font-bold mb-6">
          <Star className="w-6 h-6 text-primary" />
          Reviews
        </h2>
        {library.reviews.length === 0 ? (
          <p className="text-dark-text">No reviews written yet.</p>
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
          <p className="text-dark-text">No games marked as played.</p>
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
          <p className="text-dark-text">Wishlist is empty.</p>
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
          <p className="text-dark-text">No liked games.</p>
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
