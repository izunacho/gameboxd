'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getGameDetails, getErrorMessage } from '@/lib/api-client';
import { IGDBGame, getIGDBImageUrl, formatReleaseDate } from '@/lib/igdb';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Bookmark, CheckCircle2, Minus, Plus, User } from 'lucide-react';
import { useAppStore, InteractionType } from '@/lib/store';
import ReviewLikeButton from '@/components/ReviewLikeButton';
import RatingBadge from '@/components/RatingBadge';
import { supabase } from '@/lib/supabase';
import { ratingColor, ratingTextColor, normalizeRating, RATING_NEUTRAL } from '@/lib/rating';
import {
  submitReview,
  deleteReview,
  getGameReviews,
  addInteractionDb,
  removeInteractionDb,
  CommunityReview,
} from '@/lib/user-data';

interface GameDetailClientProps {
  gameId: string;
}

export default function GameDetailClient({ gameId }: GameDetailClientProps) {
  const router = useRouter();
  const [game, setGame] = useState<IGDBGame | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // null means "not rated yet" — 0 is a real score, so it can't stand in for unset.
  const [rating, setRating] = useState<number | null>(null);
  const [review, setReview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);

  const [reviews, setReviews] = useState<CommunityReview[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  const [myUserId, setMyUserId] = useState<string | null>(null);
  const [prefilled, setPrefilled] = useState(false);

  const { hasInteraction, getInteraction, addInteraction, removeInteraction } = useAppStore();

  const myReview = reviews.find((r) => r.user_id === myUserId);

  // Who's looking at this page?
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setMyUserId(data.user?.id ?? null));
  }, []);

  // Pre-fill the form with the user's existing review, once, when both are known.
  useEffect(() => {
    if (prefilled || !myUserId || reviewsLoading) return;
    const existing = reviews.find((r) => r.user_id === myUserId);
    if (existing) {
      setRating(existing.rating);
      setReview(existing.content || '');
    }
    setPrefilled(true);
  }, [myUserId, reviews, reviewsLoading, prefilled]);

  // Load game details from IGDB
  useEffect(() => {
    const loadGame = async () => {
      try {
        setLoading(true);
        setError(null);
        const id = parseInt(gameId);
        const data = await getGameDetails(id);
        setGame(data);
      } catch (err) {
        setError(getErrorMessage(err));
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadGame();
  }, [gameId]);

  // Load community reviews from Supabase
  useEffect(() => {
    const loadReviews = async () => {
      try {
        setReviewsLoading(true);
        const data = await getGameReviews(parseInt(gameId));
        setReviews(data);
      } catch (err) {
        console.error('Failed to load reviews:', err);
      } finally {
        setReviewsLoading(false);
      }
    };

    loadReviews();
  }, [gameId]);

  // Nudge by one, starting from the middle if nothing is set yet.
  const adjustRating = (delta: number) =>
    setRating(normalizeRating((rating ?? 50) + delta));

  const commitIfUnset = (e: React.SyntheticEvent<HTMLInputElement>) => {
    if (rating === null) setRating(Number(e.currentTarget.value));
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!game) return;
    if (rating === null) {
      setFormError('Please choose a rating first');
      return;
    }

    setSubmitting(true);
    setFormError(null);
    setFormSuccess(false);
    try {
      await submitReview(game, rating, review);
      setFormSuccess(true);
      setReview('');
      setRating(null);
      setPrefilled(true); // don't re-prefill from the refreshed list below
      // Refresh the community reviews so the new one appears immediately
      setReviews(await getGameReviews(game.id));
    } catch (err: any) {
      if (err?.message === 'NOT_LOGGED_IN') {
        setFormError('You need to log in to post a review.');
      } else {
        setFormError('Failed to submit review. Please try again.');
        console.error(err);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!myReview || !game) return;
    if (!confirm('Delete your review? This cannot be undone.')) return;
    try {
      await deleteReview(myReview.id);
      setRating(null);
      setReview('');
      setFormSuccess(false);
      setReviews(await getGameReviews(game.id));
    } catch (err: any) {
      if (err?.message === 'NOT_LOGGED_IN') {
        router.push('/auth/login');
      } else {
        console.error('Failed to delete review:', err);
      }
    }
  };

  const toggle = async (type: InteractionType) => {
    if (!game) return;
    const existing = getInteraction(game.id, type);
    try {
      if (existing) {
        removeInteraction(existing.id);
        await removeInteractionDb(existing.id);
      } else {
        const created = await addInteractionDb(game, type);
        addInteraction(created);
      }
    } catch (err: any) {
      if (err?.message === 'NOT_LOGGED_IN') {
        router.push('/auth/login');
      } else {
        console.error('Failed to save interaction:', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border border-dark-border border-t-primary"></div>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-red-400">{error || 'Game not found'}</p>
        </div>
      </div>
    );
  }

  const isPlayed = hasInteraction(game.id, 'played');
  const isWishlisted = hasInteraction(game.id, 'wishlist');
  const isLiked = hasInteraction(game.id, 'liked');

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Game Header */}
      <div className="card overflow-hidden mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
          {/* Image */}
          <div className="col-span-1">
            {game.cover?.image_id && (
              <div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden">
                <Image
                  src={getIGDBImageUrl(game.cover.image_id, 'cover_big')}
                  alt={game.name}
                  fill
                  className="object-cover"
                />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="col-span-1 md:col-span-2">
            <h1 className="text-4xl font-bold mb-4">{game.name}</h1>

            {/* Scores */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {game.rating && (
                <div>
                  <p className="text-dark-text text-sm">User Rating</p>
                  <p className="text-2xl font-bold text-primary">{Math.round(game.rating)}</p>
                </div>
              )}
              {game.aggregated_rating && (
                <div>
                  <p className="text-dark-text text-sm">Critic Rating</p>
                  <p className="text-2xl font-bold text-primary">{Math.round(game.aggregated_rating)}</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 mb-6 flex-wrap">
              <button
                onClick={() => toggle('played')}
                className={`btn flex items-center gap-2 ${
                  isPlayed ? 'btn-primary' : 'btn-secondary'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                Played
              </button>
              <button
                onClick={() => toggle('wishlist')}
                className={`btn flex items-center gap-2 ${
                  isWishlisted ? 'btn-primary' : 'btn-secondary'
                }`}
              >
                <Bookmark className="w-4 h-4" />
                Wishlist
              </button>
              <button
                onClick={() => toggle('liked')}
                className={`btn flex items-center gap-2 ${
                  isLiked ? 'btn-primary' : 'btn-secondary'
                }`}
              >
                <Heart className="w-4 h-4" />
                Like
              </button>
            </div>

            {/* Game Info */}
            <div className="space-y-2">
              {game.first_release_date && (
                <p className="text-dark-text">
                  <span className="font-semibold">Released:</span> {formatReleaseDate(game.first_release_date)}
                </p>
              )}
              {game.platforms && game.platforms.length > 0 && (
                <p className="text-dark-text">
                  <span className="font-semibold">Platforms:</span> {game.platforms.map(p => p.name).join(', ')}
                </p>
              )}
              {game.genres && game.genres.length > 0 && (
                <p className="text-dark-text">
                  <span className="font-semibold">Genres:</span> {game.genres.map(g => g.name).join(', ')}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Game Summary */}
      {(game.summary || game.storyline) && (
        <div className="card p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">About</h2>
          <p className="text-dark-text leading-relaxed">
            {game.summary || game.storyline}
          </p>
        </div>
      )}

      {/* Review Form */}
      <div id="review-form" className="card p-6 mb-8">
        <h2 className="text-2xl font-bold mb-6">
          {myReview ? 'Edit Your Review' : 'Rate & Review'}
        </h2>
        <form onSubmit={handleSubmitReview} className="space-y-4">
          {/* Rating */}
          <div>
            <label htmlFor="rating-slider" className="block text-sm font-medium mb-3">
              Your Rating
            </label>

            <div className="flex items-center justify-between gap-4 mb-3">
              <p className="flex items-baseline">
                <span
                  className="text-4xl font-bold tabular-nums transition-none"
                  style={{ color: rating === null ? '#4B4B4B' : ratingTextColor(rating) }}
                >
                  {rating ?? '—'}
                </span>
                <span className="text-base text-dark-text ml-1">/100</span>
              </p>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => adjustRating(-1)}
                  disabled={rating === 0}
                  aria-label="Decrease rating by one"
                  className="btn-secondary w-11 h-11 flex items-center justify-center p-0 disabled:opacity-40"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => adjustRating(1)}
                  disabled={rating === 100}
                  aria-label="Increase rating by one"
                  className="btn-secondary w-11 h-11 flex items-center justify-center p-0 disabled:opacity-40"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <input
              id="rating-slider"
              type="range"
              min={0}
              max={100}
              step={1}
              value={rating ?? 50}
              onChange={(e) => setRating(Number(e.target.value))}
              // A tap that lands exactly on the starting position fires no
              // change event, so commit the value on release too.
              onPointerUp={commitIfUnset}
              onKeyUp={commitIfUnset}
              aria-valuetext={rating === null ? 'No rating selected' : `${rating} out of 100`}
              className="rating-slider"
              style={
                {
                  '--v': rating ?? 0,
                  '--fill-color': rating === null ? RATING_NEUTRAL : ratingColor(rating),
                } as React.CSSProperties
              }
            />

            <p className="text-xs text-dark-text mt-2">
              Drag the bar or use the arrow keys. 0 is a valid score.
            </p>
          </div>

          {/* Review Text */}
          <div>
            <label htmlFor="review" className="block text-sm font-medium mb-2">
              Your Review (Optional)
            </label>
            <textarea
              id="review"
              value={review}
              onChange={(e) => setReview(e.target.value)}
              maxLength={500}
              rows={5}
              className="w-full px-4 py-2 rounded-lg bg-dark-bg border border-dark-border focus:border-primary outline-none resize-none"
              placeholder="Share your thoughts about this game..."
            />
            <p className="text-xs text-dark-text mt-1">{review.length}/500</p>
          </div>

          {formError && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg text-sm">
              {formError}
            </div>
          )}

          {formSuccess && (
            <div className="bg-green-500/10 border border-green-500/50 text-green-400 p-3 rounded-lg text-sm">
              {myReview ? 'Review updated!' : 'Review published! You can see it below.'}
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting || rating === null}
              className="btn-primary flex-1 disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : myReview ? 'Update Review' : 'Submit Review'}
            </button>
            {myReview && (
              <button type="button" onClick={handleDeleteReview} className="btn-secondary">
                Delete Review
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Community Reviews */}
      <div>
        <h2 className="text-2xl font-bold mb-6">
          Community Reviews {reviews.length > 0 && `(${reviews.length})`}
        </h2>

        {reviewsLoading && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border border-dark-border border-t-primary"></div>
          </div>
        )}

        {!reviewsLoading && reviews.length === 0 && (
          <div className="card p-6 text-center text-dark-text">
            <p>No reviews yet. Be the first to review this game!</p>
          </div>
        )}

        {!reviewsLoading && reviews.length > 0 && (
          <div className="space-y-4">
            {reviews.map((r) => (
              <div key={r.id} className="card p-5">
                <div className="flex items-center justify-between mb-2">
                  <Link
                    href={`/user/${encodeURIComponent(r.username)}`}
                    className="flex items-center gap-2 font-semibold text-primary hover:underline"
                  >
                    <User className="w-4 h-4" />
                    {r.username}
                  </Link>
                  <RatingBadge rating={r.rating} />
                </div>
                {r.content && <p className="text-dark-text leading-relaxed">{r.content}</p>}
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-3">
                    <p className="text-xs text-dark-text">
                      {new Date(r.created_at).toLocaleDateString()}
                    </p>
                    {r.user_id === myUserId && (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            document.getElementById('review-form')?.scrollIntoView({ behavior: 'smooth' })
                          }
                          className="text-xs text-primary hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={handleDeleteReview}
                          className="text-xs text-red-400 hover:underline"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                  <ReviewLikeButton
                    reviewId={r.id}
                    initialLikes={r.likes}
                    initialLiked={r.likedByMe}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
