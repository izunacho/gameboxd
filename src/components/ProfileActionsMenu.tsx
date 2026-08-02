'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MoreHorizontal } from 'lucide-react';
import FollowButton from './FollowButton';
import { toggleBlock } from '@/lib/social-data';

interface ProfileActionsMenuProps {
  targetUserId: string;
  initialFollowing: boolean;
  initialBlocked: boolean;
}

/**
 * Follow button plus a small overflow menu for Block/Unblock. Blocking is a
 * rarer, more consequential action than following, so it lives behind one
 * extra click and a confirmation rather than a permanent visible button.
 */
export default function ProfileActionsMenu({
  targetUserId,
  initialFollowing,
  initialBlocked,
}: ProfileActionsMenuProps) {
  const router = useRouter();
  const [blocked, setBlocked] = useState(initialBlocked);
  const [menuOpen, setMenuOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleToggleBlock = async () => {
    const wasBlocked = blocked;
    const message = wasBlocked
      ? 'Unblock this user?'
      : 'Block this user? You will no longer see each other’s profiles or reviews.';
    if (!confirm(message)) return;

    setMenuOpen(false);
    setBusy(true);
    try {
      await toggleBlock(targetUserId, wasBlocked);
      setBlocked(!wasBlocked);
      if (!wasBlocked) {
        // The profile we're on is about to become invisible to us via RLS.
        router.push('/community');
      }
    } catch (err: any) {
      if (err?.message === 'NOT_LOGGED_IN') {
        router.push('/auth/login');
      } else {
        console.error('Failed to toggle block:', err);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {!blocked && <FollowButton targetUserId={targetUserId} initialFollowing={initialFollowing} />}

      <div className="relative">
        <button
          onClick={() => setMenuOpen((v) => !v)}
          disabled={busy}
          className="btn-secondary p-2 disabled:opacity-50"
          title="More actions"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
        {menuOpen && (
          <div className="absolute right-0 mt-2 w-40 card p-1 z-10">
            <button
              onClick={handleToggleBlock}
              className="w-full text-left text-sm px-3 py-2 rounded hover:bg-dark-bg text-red-400"
            >
              {blocked ? 'Unblock User' : 'Block User'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
