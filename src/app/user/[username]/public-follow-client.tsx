'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getUserIdByUsername } from '@/lib/user-data';
import FollowListView from '@/components/FollowListView';
import { UserX } from 'lucide-react';

interface PublicFollowClientProps {
  username: string;
  kind: 'followers' | 'following';
}

/** Shared followers/following list for a public profile. */
export default function PublicFollowClient({ username, kind }: PublicFollowClientProps) {
  const [userId, setUserId] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    getUserIdByUsername(username)
      .then((u) => setUserId(u?.id ?? null))
      .catch((err) => console.error('Failed to resolve profile:', err))
      .finally(() => setChecked(true));
  }, [username]);

  if (!checked) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border border-dark-border border-t-primary"></div>
      </div>
    );
  }

  if (!userId) {
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

  return (
    <FollowListView
      userId={userId}
      kind={kind}
      title={kind === 'followers' ? `${username}'s Followers` : `${username} follows`}
      emptyLabel={kind === 'followers' ? 'No followers yet.' : 'Not following anyone yet.'}
      backHref={`/user/${encodeURIComponent(username)}`}
    />
  );
}
