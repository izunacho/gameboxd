'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, Bookmark, CheckCircle2 } from 'lucide-react';
import { IGDBGame, getIGDBImageUrl } from '@/lib/igdb';
import { useAppStore, InteractionType } from '@/lib/store';
import { addInteractionDb, removeInteractionDb } from '@/lib/user-data';

interface GameCardProps {
  game: IGDBGame;
}

export default function GameCard({ game }: GameCardProps) {
  const router = useRouter();
  const { hasInteraction, getInteraction, addInteraction, removeInteraction } = useAppStore();

  const isPlayed = hasInteraction(game.id, 'played');
  const isWishlisted = hasInteraction(game.id, 'wishlist');
  const isLiked = hasInteraction(game.id, 'liked');

  const toggle = async (type: InteractionType) => {
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

  return (
    <Link href={`/game/${game.id}`}>
      <div className="card overflow-hidden group cursor-pointer h-full flex flex-col">
        {/* Image Container */}
        <div className="relative w-full aspect-[3/4] overflow-hidden bg-dark-bg">
          {game.cover?.image_id ? (
            <Image
              src={getIGDBImageUrl(game.cover.image_id, 'cover_big')}
              alt={game.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-dark-border to-dark-bg flex items-center justify-center">
              <span className="text-dark-text text-center px-4 text-sm">No cover image</span>
            </div>
          )}

          {/* Rating Badge */}
          {game.rating && (
            <div className="absolute top-2 right-2 bg-primary text-black font-bold px-2 py-1 rounded text-sm">
              {Math.round(game.rating)}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col flex-grow p-4">
          <h3 className="font-semibold text-sm line-clamp-2 mb-2">{game.name}</h3>

          {/* Release Date */}
          {game.first_release_date && (
            <p className="text-xs text-dark-text mb-3">
              {new Date(game.first_release_date * 1000).getFullYear()}
            </p>
          )}

          {/* Action Buttons */}
          <div className="mt-auto flex gap-2">
            <button
              onClick={(e) => {
                e.preventDefault();
                toggle('played');
              }}
              className={`flex-1 btn text-xs py-1 flex items-center justify-center gap-1 ${
                isPlayed ? 'bg-primary text-black' : 'bg-dark-border'
              }`}
              title="Mark as played"
            >
              <CheckCircle2 className="w-3 h-3" />
              <span className="hidden sm:inline">Played</span>
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                toggle('wishlist');
              }}
              className={`flex-1 btn text-xs py-1 flex items-center justify-center gap-1 ${
                isWishlisted ? 'bg-primary text-black' : 'bg-dark-border'
              }`}
              title="Add to wishlist"
            >
              <Bookmark className="w-3 h-3" />
              <span className="hidden sm:inline">Wishlist</span>
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                toggle('liked');
              }}
              className={`flex-1 btn text-xs py-1 flex items-center justify-center gap-1 ${
                isLiked ? 'bg-primary text-black' : 'bg-dark-border'
              }`}
              title="Like this game"
            >
              <Heart className="w-3 h-3" />
              <span className="hidden sm:inline">Like</span>
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
