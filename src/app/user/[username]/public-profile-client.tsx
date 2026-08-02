'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { getPublicProfile, PublicProfile } from '@/lib/user-data';
import { getFollowStatus, getFollowCounts, getBlockStatus, FollowCounts } from '@/lib/social-data';
import GameTile from '@/components/GameTile';
import Avatar from '@/components/Avatar';
import ProfileActionsMenu from '@/components/ProfileActionsMenu';
import CollapsibleSection from '@/components/CollapsibleSection';
import { CheckCircle2, Bookmark, Heart, Star, UserX } from 'lucide-react';

interface PublicProfileClientProps {
  username: string;
}

export default function PublicProfileClient({ username }: PublicProfileClientProps) {
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [viewerId, setViewerId] = useState<string | null>(null);
  const [viewerChecked, setViewerChecked] = useState(false);
  const [followCounts, setFollowCounts] = useState<FollowCounts>({ followers: 0, following: 0 });
  const [isFollowing, setIsFollowing] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);

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

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setViewerId(data.user?.id ?? null);
      setViewerChecked(true);
    });
  }, []);

  useEffect(() => {
    if (!profile) return;
    getFollowCounts(profile.id)
      .then(setFollowCounts)
      .catch((err) => console.error('Failed to load follow counts:', err));
    if (viewerId && viewerId !== profile.id) {
      getFollowStatus(viewerId, profile.id)
        .then(setIsFollowing)
        .catch((err) => console.error('Failed to load follow status:', err));
      getBlockStatus(viewerId, profile.id)
        .then((status) => setIsBlocked(status.blockedByMe))
        .catch((err) => console.error('Failed to load block status:', err));
    }
  }, [profile, viewerId]);

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
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Profile Header */}
      <div className="card p-6 flex items-start gap-4">
        <Avatar url={profile.avatar_url} username={profile.username} size="lg" />
        <div className="flex-grow min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold min-w-0 break-words">
              {profile.username}
            </h1>
            {viewerChecked && viewerId && viewerId !== profile.id && (
              <ProfileActionsMenu
                targetUserId={profile.id}
                initialFollowing={isFollowing}
                initialBlocked={isBlocked}
              />
            )}
          </div>
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
          <p className="text-dark-text text-sm mt-1">
            <Link
              href={`/user/${encodeURIComponent(profile.username)}/followers`}
              className="hover:text-primary hover:underline"
            >
              {followCounts.followers} {followCounts.followers === 1 ? 'follower' : 'followers'}
            </Link>{' '}
            ·{' '}
            <Link href={`/user/${encodeURIComponent(profile.username)}/following`} className="hover:text-primary hover:underline">
              {followCounts.following} following
            </Link>
          </p>
        </div>
      </div>

      {/* Reviews */}
      <CollapsibleSection
        title="Reviews"
        count={library.reviews.length}
        icon={Star}
        emptyLabel="No reviews written yet."
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
      </CollapsibleSection>

      {/* Played */}
      <CollapsibleSection
        title="Played"
        count={played.length}
        icon={CheckCircle2}
        emptyLabel="No games marked as played."
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
        emptyLabel="Wishlist is empty."
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
        emptyLabel="No liked games."
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
