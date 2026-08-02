'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { loadMyLibrary, deleteReview, getMyProfile, MyLibrary, MyProfile } from '@/lib/user-data';
import { getFollowCounts, FollowCounts } from '@/lib/social-data';
import GameTile from '@/components/GameTile';
import Avatar from '@/components/Avatar';
import ProfileEditor from '@/components/ProfileEditor';
import CollapsibleSection from '@/components/CollapsibleSection';
import { User, CheckCircle2, Bookmark, Heart, Star, Pencil } from 'lucide-react';

export default function ProfilePage() {
  const [username, setUsername] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [profile, setProfile] = useState<MyProfile | null>(null);
  const [library, setLibrary] = useState<MyLibrary>({ interactions: [], reviews: [] });
  const [followCounts, setFollowCounts] = useState<FollowCounts>({ followers: 0, following: 0 });
  const [editing, setEditing] = useState(false);
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
        setProfile(await getMyProfile());
        setLibrary(await loadMyLibrary());
        setFollowCounts(await getFollowCounts(data.user.id));
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Delete this review? This cannot be undone.')) return;
    try {
      await deleteReview(reviewId);
      setLibrary((prev) => ({
        ...prev,
        reviews: prev.reviews.filter((r) => r.id !== reviewId),
      }));
    } catch (err) {
      console.error('Failed to delete review:', err);
    }
  };

  const handleProfileSaved = (changes: { avatarUrl?: string; bio?: string | null }) => {
    setProfile((prev) =>
      prev
        ? {
            ...prev,
            avatar_url: changes.avatarUrl ?? prev.avatar_url,
            bio: changes.bio !== undefined ? changes.bio : prev.bio,
          }
        : prev
    );
  };

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
  const displayName = profile?.username || username || 'Player';

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Profile Header */}
      <div className="card p-6 flex items-start gap-4">
        <Avatar url={profile?.avatar_url ?? null} username={displayName} size="lg" />
        <div className="flex-grow min-w-0">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-3xl font-bold">{displayName}</h1>
            <button
              onClick={() => setEditing((v) => !v)}
              className="btn-secondary text-sm flex items-center gap-1.5 shrink-0"
            >
              <Pencil className="w-4 h-4" />
              Edit profile
            </button>
          </div>
          {profile?.bio && <p className="text-dark-text mt-1">{profile.bio}</p>}
          {email && <p className="text-dark-text text-sm mt-1">{email}</p>}
          <p className="text-dark-text text-sm mt-1">
            {played.length} played · {wishlist.length} wishlisted · {liked.length} liked ·{' '}
            {library.reviews.length} review(s)
          </p>
          <p className="text-dark-text text-sm mt-1">
            <Link href="/profile/followers" className="hover:text-primary hover:underline">
              {followCounts.followers} followers
            </Link>{' '}
            ·{' '}
            <Link href="/profile/following" className="hover:text-primary hover:underline">
              {followCounts.following} following
            </Link>
          </p>
        </div>
      </div>

      {editing && (
        <ProfileEditor
          avatarUrl={profile?.avatar_url ?? null}
          bio={profile?.bio ?? null}
          username={displayName}
          onSaved={handleProfileSaved}
          onClose={() => setEditing(false)}
        />
      )}

      {/* My Reviews */}
      <CollapsibleSection
        title="My Reviews"
        count={library.reviews.length}
        icon={Star}
        emptyLabel={
          <>
            You haven't reviewed any games yet.{' '}
            <Link href="/explore" className="text-primary hover:underline">
              Find one to rate!
            </Link>
          </>
        }
      >
        <div className="space-y-4 pt-4">
          {library.reviews.map((r) => (
            <div key={r.id} className="flex gap-4">
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
                {r.content && <p className="text-dark-text text-sm line-clamp-3">{r.content}</p>}
                <div className="flex items-center gap-3 mt-2">
                  <p className="text-xs text-dark-text">
                    {new Date(r.created_at).toLocaleDateString()}
                  </p>
                  <Link
                    href={`/game/${r.game.igdb_id}`}
                    className="text-xs text-primary hover:underline"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDeleteReview(r.id)}
                    className="text-xs text-red-400 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CollapsibleSection>

      {/* Played */}
      <CollapsibleSection
        title="Played"
        count={played.length}
        icon={CheckCircle2}
        emptyLabel="No games marked as played yet."
      >
        <div className="game-grid pt-4">
          {played.map((i) => (
            <GameTile key={i.id} game={i.game} />
          ))}
        </div>
      </CollapsibleSection>

      {/* Wishlist */}
      <CollapsibleSection
        title="Wishlist"
        count={wishlist.length}
        icon={Bookmark}
        emptyLabel="Your wishlist is empty."
      >
        <div className="game-grid pt-4">
          {wishlist.map((i) => (
            <GameTile key={i.id} game={i.game} />
          ))}
        </div>
      </CollapsibleSection>

      {/* Liked */}
      <CollapsibleSection
        title="Liked"
        count={liked.length}
        icon={Heart}
        emptyLabel="You haven't liked any games yet."
      >
        <div className="game-grid pt-4">
          {liked.map((i) => (
            <GameTile key={i.id} game={i.game} />
          ))}
        </div>
      </CollapsibleSection>
    </div>
  );
}
