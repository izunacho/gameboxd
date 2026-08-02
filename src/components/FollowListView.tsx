'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getFollowersList, getFollowingList, SocialUser } from '@/lib/social-data';
import SocialUserList from './SocialUserList';

interface FollowListViewProps {
  userId: string;
  kind: 'followers' | 'following';
  title: string;
  emptyLabel: string;
  backHref: string;
}

/** Shared body for the four followers/following list pages (own + public profile). */
export default function FollowListView({
  userId,
  kind,
  title,
  emptyLabel,
  backHref,
}: FollowListViewProps) {
  const [users, setUsers] = useState<SocialUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = kind === 'followers' ? getFollowersList : getFollowingList;
    setLoading(true);
    load(userId)
      .then(setUsers)
      .catch((err) => console.error(`Failed to load ${kind}:`, err))
      .finally(() => setLoading(false));
  }, [userId, kind]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link href={backHref} className="flex items-center gap-1 text-dark-text hover:text-primary text-sm mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back to profile
      </Link>
      <h1 className="text-2xl font-bold mb-6">{title}</h1>
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border border-dark-border border-t-primary"></div>
        </div>
      ) : (
        <SocialUserList users={users} emptyLabel={emptyLabel} />
      )}
    </div>
  );
}
