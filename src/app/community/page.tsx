'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Users, User, Star } from 'lucide-react';
import { getCommunityFeed, FeedReview } from '@/lib/user-data';
import ReviewLikeButton from '@/components/ReviewLikeButton';

const PAGE_SIZE = 20;

/** "3 hours ago" style relative time */
function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function CommunityPage() {
  const [feed, setFeed] = useState<FeedReview[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getCommunityFeed(0, PAGE_SIZE);
        setFeed(data);
        setHasMore(data.length === PAGE_SIZE);
      } catch (err) {
        setError('Failed to load the community feed. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const loadMore = async () => {
    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      const data = await getCommunityFeed(nextPage, PAGE_SIZE);
      setFeed((prev) => [...prev, ...data]);
      setPage(nextPage);
      setHasMore(data.length === PAGE_SIZE);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <Users className="w-8 h-8 text-primary" />
        <h1 className="text-4xl font-bold">Community</h1>
      </div>
      <p className="text-dark-text mb-10">The latest reviews from Hitboxd players.</p>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-lg mb-8">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border border-dark-border border-t-primary"></div>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && feed.length === 0 && (
        <div className="card p-10 text-center space-y-4">
          <Star className="w-10 h-10 text-primary mx-auto" />
          <h2 className="text-xl font-bold">No reviews yet</h2>
          <p className="text-dark-text">
            Be the first to review a game and start the conversation.
          </p>
          <Link href="/explore" className="btn-primary inline-block">
            Explore Games
          </Link>
        </div>
      )}

      {/* Feed */}
      {!loading && feed.length > 0 && (
        <div className="space-y-4">
          {feed.map((r) => (
            <article key={r.id} className="card p-5 flex gap-4">
              {/* Game cover */}
              <Link href={`/game/${r.game.igdb_id}`} className="shrink-0">
                <div className="relative w-16 h-20 md:w-20 md:h-28 rounded overflow-hidden bg-dark-bg">
                  {r.game.background_image ? (
                    <Image
                      src={r.game.background_image}
                      alt={r.game.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-dark-text text-[10px] text-center px-1">No cover</span>
                    </div>
                  )}
                </div>
              </Link>

              {/* Review body */}
              <div className="flex-grow min-w-0">
                <div className="flex items-start justify-between gap-3 mb-1">
                  <div className="min-w-0">
                    <Link
                      href={`/game/${r.game.igdb_id}`}
                      className="font-bold hover:text-primary block truncate"
                    >
                      {r.game.name}
                      {r.game.released && (
                        <span className="text-dark-text font-normal text-sm ml-2">
                          {new Date(r.game.released).getFullYear()}
                        </span>
                      )}
                    </Link>
                    <p className="flex items-center gap-1.5 text-sm text-dark-text mt-0.5">
                      <User className="w-3.5 h-3.5 text-primary" />
                      <Link
                        href={`/user/${encodeURIComponent(r.username)}`}
                        className="text-primary font-medium hover:underline"
                      >
                        {r.username}
                      </Link>
                      <span>· {timeAgo(r.created_at)}</span>
                    </p>
                  </div>
                  <span className="bg-primary text-black font-bold px-2 py-0.5 rounded text-sm shrink-0">
                    {r.rating}/100
                  </span>
                </div>

                {r.content && (
                  <p className="text-dark-text text-sm leading-relaxed mt-2 line-clamp-4">
                    {r.content}
                  </p>
                )}

                <div className="mt-3">
                  <ReviewLikeButton
                    reviewId={r.id}
                    initialLikes={r.likes}
                    initialLiked={r.likedByMe}
                  />
                </div>
              </div>
            </article>
          ))}

          {/* Load more */}
          {hasMore && (
            <div className="text-center pt-4">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="btn-secondary disabled:opacity-50"
              >
                {loadingMore ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
