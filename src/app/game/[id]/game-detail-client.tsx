'use client';

import { useEffect, useState } from 'react';
import { getGameDetails } from '@/lib/api-client';
import { getErrorMessage } from '@/lib/api-client';
import { IGDBGame, getIGDBImageUrl, formatReleaseDate } from '@/lib/igdb';
import Image from 'next/image';
import { Heart, Bookmark, CheckCircle2, Star } from 'lucide-react';
import { useAppStore } from '@/lib/store';

interface GameDetailClientProps {
  gameId: string;
}

export default function GameDetailClient({ gameId }: GameDetailClientProps) {
  const [game, setGame] = useState<IGDBGame | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { hasInteraction, addInteraction, removeInteraction, interactions } = useAppStore();

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

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!game || rating === 0) {
      setError('Please provide a rating');
      return;
    }

    setSubmitting(true);
    try {
      addInteraction({
        id: crypto.randomUUID(),
        gameId: game.id,
        userId: 'temp',
        type: 'played',
        createdAt: new Date().toISOString(),
      });

      setReview('');
      setRating(0);
      alert('Review submitted successfully!');
    } catch (err) {
      setError('Failed to submit review');
    } finally {
      setSubmitting(false);
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

  const gameIdNum = game.id;
  const isPlayed = hasInteraction(gameIdNum, 'played');
  const isWishlisted = hasInteraction(gameIdNum, 'wishlist');
  const isLiked = hasInteraction(gameIdNum, 'liked');

  const togglePlayed = () => {
    if (isPlayed) {
      const interaction = interactions.find(
        (i) => i.gameId === gameIdNum && i.type === 'played'
      );
      if (interaction) removeInteraction(interaction.id);
    } else {
      addInteraction({
        id: crypto.randomUUID(),
        gameId: gameIdNum,
        userId: 'temp',
        type: 'played',
        createdAt: new Date().toISOString(),
      });
    }
  };

  const toggleWishlist = () => {
    if (isWishlisted) {
      const interaction = interactions.find(
        (i) => i.gameId === gameIdNum && i.type === 'wishlist'
      );
      if (interaction) removeInteraction(interaction.id);
    } else {
      addInteraction({
        id: crypto.randomUUID(),
        gameId: gameIdNum,
        userId: 'temp',
        type: 'wishlist',
        createdAt: new Date().toISOString(),
      });
    }
  };

  const toggleLike = () => {
    if (isLiked) {
      const interaction = interactions.find(
        (i) => i.gameId === gameIdNum && i.type === 'liked'
      );
      if (interaction) removeInteraction(interaction.id);
    } else {
      addInteraction({
        id: crypto.randomUUID(),
        gameId: gameIdNum,
        userId: 'temp',
        type: 'liked',
        createdAt: new Date().toISOString(),
      });
    }
  };

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
                  <p className="text-dark-text text-sm">Aggregated Rating</p>
                  <p className="text-2xl font-bold text-primary">{Math.round(game.aggregated_rating)}</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 mb-6 flex-wrap">
              <button
                onClick={togglePlayed}
                className={`btn flex items-center gap-2 ${
                  isPlayed ? 'btn-primary' : 'btn-secondary'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                Played
              </button>
              <button
                onClick={toggleWishlist}
                className={`btn flex items-center gap-2 ${
                  isWishlisted ? 'btn-primary' : 'btn-secondary'
                }`}
              >
                <Bookmark className="w-4 h-4" />
                Wishlist
              </button>
              <button
                onClick={toggleLike}
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
      <div className="card p-6 mb-8">
        <h2 className="text-2xl font-bold mb-6">Rate & Review</h2>
        <form onSubmit={handleSubmitReview} className="space-y-4">
          {/* Star Rating */}
          <div>
            <label className="block text-sm font-medium mb-3">Your Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star * 20)}
                  className="text-2xl transition hover:scale-110"
                >
                  <Star
                    className="w-8 h-8 transition-all"
                    fill={star * 20 <= rating ? '#00D084' : 'none'}
                    color={star * 20 <= rating ? '#00D084' : '#2D2D2D'}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && <p className="text-sm text-primary mt-2">Rating: {rating}/100</p>}
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

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button type="submit" disabled={submitting || rating === 0} className="btn-primary w-full">
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      </div>

      {/* Reviews Section */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Community Reviews</h2>
        <div className="card p-6 text-center text-dark-text">
          <p>Reviews will appear here once the backend is connected</p>
        </div>
      </div>
    </div>
  );
}
