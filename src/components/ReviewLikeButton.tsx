'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Heart } from 'lucide-react';
import { toggleReviewLike } from '@/lib/user-data';

interface ReviewLikeButtonProps {
  reviewId: string;
  initialLikes: number;
  initialLiked: boolean;
}

/**
 * Heart button for liking reviews. Optimistic: updates instantly,
 * rolls back if the server rejects. Redirects to login when logged out.
 */
export default function ReviewLikeButton({
  reviewId,
  initialLikes,
  initialLiked,
}: ReviewLikeButtonProps) {
  const router = useRouter();
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(initialLiked);
  const [busy, setBusy] = useState(false);

  // Keep in sync when the parent list refetches
  useEffect(() => {
    setLikes(initialLikes);
    setLiked(initialLiked);
  }, [initialLikes, initialLiked]);

  const handleClick = async () => {
    if (busy) return;
    setBusy(true);

    const wasLiked = liked;
    const prevLikes = likes;
    setLiked(!wasLiked);
    setLikes(prevLikes + (wasLiked ? -1 : 1));

    try {
      await toggleReviewLike(reviewId, wasLiked);
    } catch (err: any) {
      // Roll back the optimistic update
      setLiked(wasLiked);
      setLikes(prevLikes);
      if (err?.message === 'NOT_LOGGED_IN') {
        router.push('/auth/login');
      } else {
        console.error('Failed to toggle review like:', err);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={busy}
      className={`flex items-center gap-1.5 text-sm transition-colors ${
        liked ? 'text-primary' : 'text-dark-text hover:text-primary'
      }`}
      title={liked ? 'Unlike this review' : 'Like this review'}
    >
      <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
      <span>{likes}</span>
    </button>
  );
}
