'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toggleFollow } from '@/lib/social-data';

interface FollowButtonProps {
  targetUserId: string;
  initialFollowing: boolean;
}

/**
 * Follow/unfollow button. Optimistic: updates instantly, rolls back if the
 * server rejects (e.g. a block exists). Redirects to login when logged out.
 */
export default function FollowButton({ targetUserId, initialFollowing }: FollowButtonProps) {
  const router = useRouter();
  const [following, setFollowing] = useState(initialFollowing);
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Keep in sync when the parent refetches
  useEffect(() => {
    setFollowing(initialFollowing);
  }, [initialFollowing]);

  // Auto-clear the error message after a few seconds
  useEffect(() => {
    if (!errorMsg) return;
    const t = setTimeout(() => setErrorMsg(null), 4000);
    return () => clearTimeout(t);
  }, [errorMsg]);

  const handleClick = async () => {
    if (busy) return;
    setBusy(true);
    setErrorMsg(null);

    const wasFollowing = following;
    setFollowing(!wasFollowing);

    try {
      await toggleFollow(targetUserId, wasFollowing);
    } catch (err: any) {
      setFollowing(wasFollowing);
      if (err?.message === 'NOT_LOGGED_IN') {
        router.push('/auth/login');
      } else {
        setErrorMsg(wasFollowing ? "Couldn't unfollow. Try again." : "Couldn't follow. Try again.");
        console.error('Failed to toggle follow:', err);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleClick}
        disabled={busy}
        className={`btn ${following ? 'btn-secondary' : 'btn-primary'} disabled:opacity-50`}
      >
        {following ? 'Following' : 'Follow'}
      </button>
      {errorMsg && <p className="text-xs text-red-400">{errorMsg}</p>}
    </div>
  );
}
